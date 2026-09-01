import { Client, Query, TablesDB, Storage, ID } from "appwrite"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { apiError } from "../../utils/apiError.js"
import { apiResponse } from "../../utils/apiResponse.js"
import { MathsQuestionSubmissionModel } from "../../models/mathsQuestionSubmissions.js"
import express from "express"
import { MathQuestionSubmissionModel2 } from "../modelsv2/mathQuestionSubmission2.js"
import fs from 'fs'
import path from "path"
import { englishQuestionSubmissionModel } from "../modelsv2/englishQuestionSubmission.js"
import { getOrSetCache } from "../../utils/redis.js"


const appwriteDatabaseId = process.env.APPWRITE_DATABASE_ID
const satMathKaplanCollectionId = process.env.SAT_MATH_KAPLAN_COLLECTION_ID
const satEnglishCollectionId = process.env.SAT_ENGLISH_COLLECTION_ID
const projectId = process.env.APPWRITE_PROJECT_ID
const bucketId = process.env.APPWRITE_BUCKET_ID
const client = new Client().setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject(projectId)
const tablesDB = new TablesDB(client)
const storage = new Storage(client)


/* 
you to find all these values in this method
-answerImageLink
-questionImageLink
- subtopic is chapterNumber
- there is no questionID , you can use unique identifier















*/














export const getQuestion2 = asyncHandler(async (req, res) => {
  const { chapterNumber, questionNumber } = req.query;
  const cacheKey = `sat:math:ch_${chapterNumber}:q_${questionNumber}`;

  const data = await getOrSetCache(cacheKey, 86400, async () => {
    const questionObject = await tablesDB.listRows({
      databaseId: appwriteDatabaseId,
      tableId: satMathKaplanCollectionId,
      queries: [
        Query.equal('questionNumber', questionNumber),
        Query.equal('subtopic', `chapter ${chapterNumber}`)
      ]
    });

    if (!questionObject || !questionObject.rows || questionObject.rows.length === 0) {
      throw new apiError(400, "question was not successfully fetched from appwrite database");
    }

    const answerImageLink = storage.getFileView({
      bucketId: bucketId,
      fileId: questionObject.rows[0].answerImageResponseId
    });
    const questionImageLink = storage.getFileView({
      bucketId: bucketId,
      fileId: questionObject.rows[0].questionImageResponseId
    });

    return {
      questionObject,
      questionImageLink,
      answerImageLink
    };
  });

  return res.status(200).json(new apiResponse(200, data, "question delivered by backend successfully"));
})







export const mathQuestionSubmissionMethod2 = asyncHandler(
  async (req, res) => {
    const {
      questionId, isHintViewed, isAnswerViewed,
      isCorrect, retryCount, timeTakenInMinAnswer, timeTakenInSecAnswer,
      timeTakenInSecHint, timeTakenInMinHint, attemptMode, calculatorUse, exam,
      level, questionNumber, responseType, section, topic, attemptId, chapterNumber
    } = req.body
    const { userId } = req
    const uniqueSubmissionId = ID.unique()
    console.log(timeTakenInMinHint)
    // everything is not with us


    // attemptId will be the unique seesion identifier of the user on the frontend,  also the userId will be coming from middleware 

    /*   console.log( questionId, userId, attemptId ,isHintViewed, isAnswerViewed, 
           isCorrect, retryCount , timeTakenInMinAnswer, timeTakenInMinAnswer, 
           timeTakenInSecHint, timeTakenInMinHint , attemptMode, calculatorUse, exam  ,
           level, questionNumber, responseType, section, chapterNumber, topic 
          
      )   
           */
    const timeTakenInSecondsAnswer = (timeTakenInSecAnswer) + (timeTakenInMinAnswer) * 60
    const timeTakenInSecondsHint = (timeTakenInSecHint) + (timeTakenInMinHint) * 60

    const response = MathQuestionSubmissionModel2.create({

      questionId: questionId, userId: userId, attemptId: attemptId, isHintViewed: isHintViewed, isAnswerViewed: isAnswerViewed,
      isCorrect: isCorrect, retryCount: retryCount, timeTakenInMinAnswer: timeTakenInMinAnswer, timeTakenInSecAnswer: timeTakenInSecAnswer,
      timeTakenInSecHint: timeTakenInSecHint, timeTakenInMinHint: timeTakenInMinHint, attemptMode: attemptMode, calculatorUse: calculatorUse, exam: exam,
      level: level, questionNumber: questionNumber, responseType: responseType, section: section, chapterNumber: chapterNumber, topic: topic, uniqueSubmissionId: uniqueSubmissionId,
      timeTakenInSecondsAnswer: timeTakenInSecondsAnswer, timeTakenInSecondsHint: timeTakenInSecondsHint

    })
    console.log(response)
    return res.status(200).json(new apiResponse(200, {
      "status": "done"
    }, "question submitted successfully"))
    // console.log(`time for submission: ${timeTakenInMinAnswer}M ${timeTakenInSecAnswer}S`)
    // console.log(`time for loooking hint ${timeTakenInMinHint}M ${timeTakenInSecHint}S`)
  }
)















// this is the test script to extract question information about level from appwrite database, about how many , maths section
export const questionInfoExtraction = asyncHandler(async (req, res) => {
  const [
    total,
    easy,
    medium,
    hard
  ] = await Promise.all([
    tablesDB.listRows(appwriteDatabaseId, satMathKaplanCollectionId, [Query.limit(1)]),
    tablesDB.listRows(appwriteDatabaseId, satMathKaplanCollectionId, [Query.equal("level", "Easy"), Query.limit(1)]),
    tablesDB.listRows(appwriteDatabaseId, satMathKaplanCollectionId, [Query.equal("level", "Medium"), Query.limit(1)]),
    tablesDB.listRows(appwriteDatabaseId, satMathKaplanCollectionId, [Query.equal("level", "Hard"), Query.limit(1)]),
  ]);

  const stats = {
    total: total.total,
    easy: easy.total,
    medium: medium.total,
    hard: hard.total,
  };

  console.log(stats);
  return res.status(200).json(new apiResponse(200, { stats }, "fetched successfully"))



})




export const getEnglishQuestion = asyncHandler(async (req, res) => {
  const { questionNumber, moduleNumber } = req.query;
  const cacheKey = `sat:english:m_${moduleNumber}:q_${questionNumber}`;

  const data = await getOrSetCache(cacheKey, 86400, async () => {
    const questionObject = await tablesDB.listRows({
      databaseId: appwriteDatabaseId,
      tableId: satEnglishCollectionId,
      queries: [
        Query.equal('questionNumberInThatModule', questionNumber),
        Query.equal('moduleNumber', moduleNumber)
      ]
    });

    if (!questionObject || !questionObject.rows || questionObject.rows.length === 0) {
      throw new apiError(400, "question was not successfully fetched from appwrite database");
    }

    const mediaId = questionObject.rows[0]?.questionMediaResponseId;
    const questionImageLink = (mediaId && mediaId.trim() !== "")
      ? `https://nyc.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${mediaId}/view?project=${projectId}&mode=admin`
      : null;
    if (questionImageLink) {
      questionObject.rows[0].questionImageLink = questionImageLink;
    }

    return {
      questionObject: questionObject.rows[0],
      questionMediaLink: questionImageLink
    };
  });

  return res.status(200).json(new apiResponse(200, data, "english question delivered successfully"));
})





export const englishQuestionsFetch = asyncHandler(async (req, res) => {
  // this is the method to fetch specific attributes from the whole collection of englishQuestions
  /*
   
    const LIMIT = 100;
    let offset = 0;
    let allQuestions= [];
    while (true) {
      const response = await tablesDB.listRows(
        appwriteDatabaseId,
        satEnglishCollectionId,
        [
          Query.select([
            "questionTypeNumber",
            "difficulty",
            "moduleNumber",
            "questionNumberInThatModule",
          ]),
          Query.limit(LIMIT),
          Query.offset(offset),
        ]
      );
    
      allQuestions.push(...response.rows);
    
      if (response.rows.length < LIMIT) break;
    
      offset += LIMIT;
    }
    // file writing logoc
    const outputPath = path.join(process.cwd(), "questions.js");
  
  const fileContent = `
  export const questions = ${JSON.stringify(allQuestions, null, 2)};
  `;
  
  fs.writeFileSync(outputPath, fileContent, "utf-8");
  
  console.log("✅ Questions file generated using TablesDB");
  
  return
  */
})






// this is the controller to submit englishQuestion Attempts
export const submitEnglishQuestion = asyncHandler(async (req, res) => {
  const { isCorrect, moduleNumber, questionNumber, level, questionTypeNumber, questionId } = req.query
  const { userId } = req
  const uniqueSubmissionId = ID.unique()
  console.log(questionNumber)
  const response = await englishQuestionSubmissionModel.create({
    questionId,
    userId,
    isCorrect,
    exam: "SAT",
    level: level,
    questionNumber,
    moduleNumber,
    questionTypeNumber,
    uniqueSubmissionId


  })
  if (!response) {
    return res.status(500).json((new apiResponse(500, { "failed uploading question Submission to Database": "lol" }, "failed uploading question Submission to Database")))
  }
  return res.status(200).json(new apiResponse(200, { response }, "successfully uploaded questionSubmission to database"))


})




// this is the controller to find which Questions are solved by each QuestionTypeNumber, in english section
export const getSolvedQuestionsByQuestionTypeNumber = asyncHandler(async (req, res) => {
  console.log("getSolvedQuestionsByQuestionTypeNumber ran")
  const { userId } = req
  const { questionTypeNumber } = req.query
  const response = await englishQuestionSubmissionModel.aggregate([
    /* 1️⃣ Filter by user + question type + correct */
    {
      $match: {
        userId: userId,
        questionTypeNumber: questionTypeNumber,
        isCorrect: true
      }
    },

    /* 2️⃣ Make each question unique */
    {
      $group: {
        _id: "$questionId",
        questionId: { $first: "$questionId" },
        level: { $first: "$level" },
        questionNumber: { $first: "$questionNumber" },
        moduleNumber: { $first: "$moduleNumber" },
        questionTypeNumber: { $first: "$questionTypeNumber" },
        solvedAt: { $min: "$createdAt" }
      }
    },

    /* 3️⃣ Clean output */
    {
      $project: {

        questionId: 1,
        questionNumber: 1,
        moduleNumber: 1,
        questionTypeNumber: 1,


      }
    },

    { $sort: { solvedAt: 1 } }
  ]);
  // console.log(response)
  if (!response) {
    return res.status(403).json(new apiResponse(403, { "failed while fetching for": "getSolvedQuestionsByQuestionTypeNumber" }), "failed while getSolvedQuestionsByQuestionTypeNumber")
  }
  return res.status(200).json(new apiResponse(200, response, "successfully fetching information for getSolvedQuestionsByQuestionTypeNumber"))
})