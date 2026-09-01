import {Router} from "express"
import { getQuestion } from "../controllers/main.controller.js"
import { googleLogin, jwtVerifyMain } from "../controllers/auth.controller.js"
import { authtest } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { mathsQuestionSubmissionMethod } from "../controllers/main.controller.js"
import { getSolvedMathsQuestionsMethod } from "../controllers/main.controller.js"
import { englishQuestionsFetch, getQuestion2, questionInfoExtraction, getEnglishQuestion, submitEnglishQuestion, getSolvedQuestionsByQuestionTypeNumber } from "../apiV2/controllersv2/main.controller.js"
import { VerifyIdentity, VerifyIdentity2 } from "../apiV2/middlewaresv2/verifyIdentity.js"
import { mathQuestionSubmissionMethod2 } from "../apiV2/controllersv2/main.controller.js"
import { englishAnalyticsFetch, getMathAnalytics, getSolvedQuestions } from "../apiV2/controllersv2/analytics.controller.js"
import { aiChatController } from "../apiV2/AiControllers/ai.controller.js"
const router = Router()
router.route("/practice/sat/maths").get(verifyJWT, getQuestion) 
router.route("/auth/test").get(authtest)
router.route("/auth/google").get(googleLogin)
router.route("/auth/landingPageJWTVerifier").get(jwtVerifyMain)
router.route("/practice/sat/maths/mathsQuestionSubmission").get(verifyJWT, mathsQuestionSubmissionMethod)
router.route("/practice/sat/maths/getSolvedMathsQuestions").get(verifyJWT, getSolvedMathsQuestionsMethod)





router.route("/api/v2/sat/maths/getQuestion").get(VerifyIdentity2, getQuestion2)
router.route("/api/v2/sat/maths/mathQuestionSubmission").post(VerifyIdentity2, mathQuestionSubmissionMethod2)
router.route("/api/v2/authTesting").post(VerifyIdentity2, authtest)






router.route("/api/v2/sat/maths/analytics/getSolvedQuestionNumbers").get(VerifyIdentity2, getSolvedQuestions )
router.route("/api/v2/sat/maths/analytics").get(VerifyIdentity2, getMathAnalytics) // this is  the route to get solved Questions by chapterNumber 










// route for fetching number of level-wise and total questions
router.route("/api/v2/sat/maths/fetchLevels").get(questionInfoExtraction)

//route for fetching infomation about english questions for filtering and other in site processes
router.route("/api/v2/sat/english/fetchQuestions").get(englishQuestionsFetch)

// this is the route for sending englishQuestionObject to frontend
router.route("/api/v2/sat/english/getEnglishQuestion").get(VerifyIdentity2, getEnglishQuestion)


// this is the route for english question attempt submission
router.route("/api/v2/sat/english/submitEnglishQuestion").get(VerifyIdentity2, submitEnglishQuestion)



// this is the route to fetch englishSection Analytics
router.route("/api/v2/sat/english/getEnglishAnalytics").get(VerifyIdentity2, englishAnalyticsFetch)


//this is the route to get questionSolvedByQuestionTypeNumber to render which quesitons are solved
router.route("/api/v2/sat/english/getSolvedQuestionsByQuestionTypeNumber").get(VerifyIdentity2, getSolvedQuestionsByQuestionTypeNumber )




// AI Tutor Route (Multimodal Gemini SAT Tutor)
router.route("/api/v2/sat/ai/chat").post(VerifyIdentity2, aiChatController)

// router.route("/api/v2/sat/maths/ ")

// router.route("/sat/maths").get(authMethod)
export {router}
