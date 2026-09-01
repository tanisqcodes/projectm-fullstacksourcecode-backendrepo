import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { apiError } from "../../utils/apiError.js";

/**
 * Fetch image buffer from a public/accessible URL and return inlineData format for Gemini API
 */
async function fetchImagePart(imageUrl) {
  if (
    !imageUrl ||
    typeof imageUrl !== "string" ||
    !imageUrl.startsWith("http") ||
    imageUrl.includes("files//view") ||
    imageUrl.includes("/files//")
  ) {
    return null;
  }
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 9000,
    });
    const contentType = response.headers["content-type"] || "image/png";
    const base64Data = Buffer.from(response.data).toString("base64");
    return {
      inlineData: {
        data: base64Data,
        mimeType: contentType.split(";")[0] || "image/png",
      },
    };
  } catch (err) {
    console.warn(`[AI Controller] Notice: Could not fetch image from URL: ${imageUrl}`, err.message);
    return null;
  }
}

/**
 * Build a structured context block for the question
 */
function buildQuestionContextString(context = {}) {
  const parts = [];
  parts.push("=== SAT QUESTION CONTEXT ===");
  if (context.exam) parts.push(`Exam: ${context.exam}`);
  if (context.section) parts.push(`Section: ${context.section}`);
  if (context.topic) parts.push(`Topic: ${context.topic}`);
  if (context.subtopic) parts.push(`Subtopic / Chapter: ${context.subtopic}`);
  if (context.difficulty) parts.push(`Difficulty Level: ${context.difficulty}`);
  if (context.questionType) parts.push(`Question Type: ${context.questionType}`);
  if (context.questionId) parts.push(`Question ID: ${context.questionId}`);
  if (context.questionText) parts.push(`Question Text:\n${context.questionText}`);

  if (context.options) {
    parts.push("Options:");
    if (typeof context.options === "object") {
      Object.entries(context.options).forEach(([k, v]) => {
        if (v) parts.push(`  Option ${k}: ${v}`);
      });
    }
  }

  if (context.correctAnswer) parts.push(`Official Correct Answer: ${context.correctAnswer}`);
  if (context.hint) parts.push(`Official Hint: ${context.hint}`);
  if (context.answerExplanation) parts.push(`Official Explanation: ${context.answerExplanation}`);

  if (context.userAnswer !== undefined && context.userAnswer !== null && context.userAnswer !== "") {
    parts.push(`Student's Chosen Answer: ${context.userAnswer}`);
    if (context.submitted !== undefined) {
      parts.push(`Submission Status: ${context.isCorrect ? "Correct" : "Incorrect"}`);
    }
  }

  parts.push("============================");
  return parts.join("\n");
}

/**
 * System prompts based on selected tutor mode
 */
function getSystemPrompt(mode = "general") {
  const baseRules = `
You are LeetCrack SAT AI Tutor, an elite, pedagogical SAT coach specialized in Math and Reading & Writing.
Guidelines:
1. Always be encouraging, concise, and crystal-clear.
2. If Math formulas or expressions are used, format them cleanly using standard readable math notation or LaTeX-style expressions (e.g. x^2 + 5x + 6 = 0, (x + 2)(x + 3) = 0).
3. If an image is provided in the context (geometry figure, coordinate graph, table, or question screenshot), visually reference its elements accurately (e.g. coordinates, axes, angle labels, shape properties).
4. Emphasize SAT test-taking strategies (desmos calculator tricks, elimination, identifying trap answers, grammar rules).
`;

  switch (mode) {
    case "hint":
      return `${baseRules}
Mode: SOCRATIC HINT
The student requested a HINT.
IMPORTANT: DO NOT reveal the final answer or option letter directly.
Provide a smart, bite-sized hint that gives the student a spark on what formula, concept, or clue in the problem they should focus on first. Ask a brief guiding question at the end to prompt their thinking.`;

    case "reasoning":
      return `${baseRules}
Mode: CONCEPTUAL REASONING
The student wants to understand the underlying logic and reasoning behind this question.
Explain the core theorem, algebraic property, or reading/grammar rule in depth. Explain why the correct option is uniquely true and why typical distractors fail.`;

    case "explanation":
      return `${baseRules}
Mode: STEP-BY-STEP EXPLANATION
Provide a structured, step-by-step walkthrough to solve the problem from scratch:
- Step 1: Identify Given Information & Goal
- Step 2: Key Formula / Approach
- Step 3: Calculation or Grammar/Passage Breakdown
- Step 4: Final Conclusion & Correct Answer Confirmation
- Quick Pro-Tip for similar SAT questions.`;

    case "wrong_answer":
      return `${baseRules}
Mode: MISCONCEPTION & ERROR ANALYSIS
The student picked an answer or wants to check why an answer might be wrong.
Analyze why their selected answer is incorrect or a trap, diagnose the conceptual pitfall (e.g., sign mistake, forgetting constraints, misplaced modifier, misreading the question prompt), and explain how to avoid it.`;

    case "general":
    default:
      return `${baseRules}
Mode: INTERACTIVE TUTOR CHAT
Answer the student's question directly, clearly, and concisely, keeping the question context and any attached diagrams in mind.`;
  }
}

/**
 * Main AI Chat Controller
 */
export const aiChatController = asyncHandler(async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new apiError(
      500,
      "GEMINI_API_KEY is not configured in backend environment variables. Please set GEMINI_API_KEY in .env"
    );
  }

  const {
    questionContext = {},
    message = "",
    mode = "general",
    chatHistory = [],
  } = req.body;

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = getSystemPrompt(mode);
  const contextText = buildQuestionContextString(questionContext);

  // Fetch question image part if media URL is available
  let imagePart = null;
  const mediaUrl =
    questionContext.questionImageLink ||
    questionContext.answerImageLink ||
    questionContext.questionMediaLink;

  if (mediaUrl) {
    imagePart = await fetchImagePart(mediaUrl);
  }

  // Construct contents array for Gemini
  const contents = [];

  if (!chatHistory || chatHistory.length === 0) {
    // First message in conversation
    const userParts = [];
    if (imagePart) {
      userParts.push(imagePart);
    }
    const userPrompt = `${contextText}\n\nStudent Request (${mode.toUpperCase()}): ${
      message || "Please assist me with this question."
    }`;
    userParts.push({ text: userPrompt });

    contents.push({
      role: "user",
      parts: userParts,
    });
  } else {
    // Multi-turn conversation with history
    // First message includes context and image part
    chatHistory.forEach((item, index) => {
      const role = item.role === "assistant" || item.role === "model" ? "model" : "user";
      const parts = [];

      if (index === 0 && role === "user") {
        if (imagePart) {
          parts.push(imagePart);
        }
        parts.push({
          text: `${contextText}\n\n${item.text || item.content || ""}`,
        });
      } else {
        parts.push({
          text: item.text || item.content || "",
        });
      }

      contents.push({ role, parts });
    });

    // Add current user prompt if not already in history
    if (message) {
      contents.push({
        role: "user",
        parts: [{ text: `[Mode: ${mode}] ${message}` }],
      });
    }
  }

  // Supported models to try with fallback (gemini-3.6-flash is recommended for current API)
  const models = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];
  let reply = "";
  let lastError = null;

  for (const model of models) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (result && result.text) {
        reply = result.text;
        break;
      }
    } catch (err) {
      console.warn(`[AI Controller] Failed with model ${model}:`, err.message);
      lastError = err;
    }
  }

  if (!reply) {
    throw new apiError(
      500,
      `Failed to generate response from Gemini API: ${lastError ? lastError.message : "Unknown error"}`
    );
  }

  return res.status(200).json(
    new apiResponse(
      200,
      {
        reply,
        mode,
      },
      "AI response generated successfully"
    )
  );
});
