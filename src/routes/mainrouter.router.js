import {Router} from "express"
import { getQuestion } from "../controllers/main.controller.js"
import { googleLogin, jwtVerifyMain } from "../controllers/auth.controller.js"
import { authtest } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { mathsQuestionSubmissionMethod } from "../controllers/main.controller.js"
import { getSolvedMathsQuestionsMethod } from "../controllers/main.controller.js"
import { getQuestion2, questionInfoExtraction } from "../apiV2/controllersv2/main.controller.js"
import { VerifyIdentity } from "../apiV2/middlewaresv2/verifyIdentity.js"
import { mathQuestionSubmissionMethod2 } from "../apiV2/controllersv2/main.controller.js"
import { getMathAnalytics, getSolvedQuestions } from "../apiV2/controllersv2/analytics.controller.js"
const router = Router()
router.route("/practice/sat/maths").get(verifyJWT, getQuestion) 
router.route("/auth/test").get(authtest)
router.route("/auth/google").get(googleLogin)
router.route("/auth/landingPageJWTVerifier").get(jwtVerifyMain)
router.route("/practice/sat/maths/mathsQuestionSubmission").get(verifyJWT, mathsQuestionSubmissionMethod)
router.route("/practice/sat/maths/getSolvedMathsQuestions").get(verifyJWT, getSolvedMathsQuestionsMethod)





router.route("/api/v2/sat/maths/getQuestion").get(VerifyIdentity, getQuestion2)
router.route("/api/v2/sat/maths/mathQuestionSubmission").post(VerifyIdentity, mathQuestionSubmissionMethod2)
router.route("/api/v2/authTesting").post(VerifyIdentity, authtest)






router.route("/api/v2/sat/maths/analytics/getSolvedQuestionNumbers").get(VerifyIdentity, getSolvedQuestions )
router.route("/api/v2/sat/maths/analytics").get(VerifyIdentity, getMathAnalytics) // this is  the route to get solved Questions by chapterNumber 










// route for fetching number of level-wise and total questions
router.route("/api/v2/sat/maths/fetchLevels").get(questionInfoExtraction)




// router.route("/api/v2/sat/maths/ ")

// router.route("/sat/maths").get(authMethod)
export {router}
