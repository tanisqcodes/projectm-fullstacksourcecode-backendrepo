import {Router} from "express"
import { getQuestion } from "../controllers/main.controller.js"
import { googleLogin } from "../controllers/auth.controller.js"
import { authtest } from "../controllers/auth.controller.js"
const router = Router()
router.route("/practice/sat/maths").get(getQuestion) 
router.route("/auth/test").get(authtest)
router.route("/auth/google").get(googleLogin)
// router.route("/sat/maths").get(authMethod)
export {router}
