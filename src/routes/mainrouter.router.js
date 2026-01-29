import {Router} from "express"
import { getQuestion } from "../controllers/main.controller.js"
import { googleLogin, jwtVerifyMain } from "../controllers/auth.controller.js"
import { authtest } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { mathsQuestionSubmissionMethod } from "../controllers/main.controller.js"
import { getSolvedMathsQuestionsMethod } from "../controllers/main.controller.js"
import { getQuestion2 } from "../apiV2/controllersv2/main.controller.js"
import { VerifyIdentity } from "../apiV2/middlewaresv2/verifyIdentity.js"
import { mathQuestionSubmissionMethod2 } from "../apiV2/controllersv2/main.controller.js"
const router = Router()
router.route("/practice/sat/maths").get(verifyJWT, getQuestion) 
router.route("/auth/test").get(authtest)
router.route("/auth/google").get(googleLogin)
router.route("/auth/landingPageJWTVerifier").get(jwtVerifyMain)
router.route("/practice/sat/maths/mathsQuestionSubmission").get(verifyJWT, mathsQuestionSubmissionMethod)
router.route("/practice/sat/maths/getSolvedMathsQuestions").get(verifyJWT, getSolvedMathsQuestionsMethod)





router.route("/api/v2/sat/maths/getQuestion").get(getQuestion2)
router.route("/api/v2/sat/maths/mathQuestionSubmission").get(mathQuestionSubmissionMethod2)
router.route("/api/v2/authTesting").post(VerifyIdentity, authtest)
// router.route("/sat/maths").get(authMethod)
export {router}
