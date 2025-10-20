import {Router} from "express"
import { getQuestion } from "../controllers/main.controller.js"
import { googleLogin, jwtVerifyMain } from "../controllers/auth.controller.js"
import { authtest } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { mathsQuestionSubmissionMethod } from "../controllers/main.controller.js"
const router = Router()
router.route("/practice/sat/maths").get(verifyJWT, getQuestion) 
router.route("/auth/test").get(authtest)
router.route("/auth/google").get(googleLogin)
router.route("/auth/landingPageJWTVerifier").get(jwtVerifyMain)
router.route("/practice/sat/maths/mathsQuestionSubmission").get(verifyJWT, mathsQuestionSubmissionMethod)
// router.route("/sat/maths").get(authMethod)
export {router}
