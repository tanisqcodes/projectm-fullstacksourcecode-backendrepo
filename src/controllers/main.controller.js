// methods we'll need to write
// when the the sat>maths section loads up we'll ping the database based
// on filters ,
// filters will be in state 
// 
import {Client , Query, TablesDB} from "appwrite"
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import dotenv from "dotenv"
import { MathsQuestionSubmissionModel } from "../models/mathsQuestionSubmissions.js";

dotenv.config({
    path: '.../.env'
})

const appwriteDatabaseId = process.env.APPWRITE_DATABASE_ID
const satMathKaplanCollectionId = process.env.SAT_MATH_KAPLAN_COLLECTION_ID
const projectId= process.env.APPWRITE_PROJECT_ID
const client = new Client().setEndpoint("https://nyc.cloud.appwrite.io/v1")
.setProject(projectId)
const tablesDB  = new TablesDB(client)






export const getQuestion = asyncHandler(async(req , res) =>  {
    console.log("getQuestionMethodRan")
     const chapterNumber = req.query.chapterNumber
     const questionNumber = req.query.questionNumber
   // console.log(appwriteDatabaseId)
     const questionObject = await tablesDB.listRows({
        databaseId: appwriteDatabaseId, 
        tableId : satMathKaplanCollectionId,
        queries: [
            Query.equal('questionNumber', questionNumber) , 
            Query.equal('subtopic',`chapter ${chapterNumber}`)

        ] 
            
     });
     if(!questionObject){
        throw new apiError(400, "question was not successfully fetched from appwrite database")
     }
     // console.log(questionObject)
     return res.status(200).json( new apiResponse(200,        
         questionObject
         , "question delivered by backend successfully"
     ))


})

export const mathsQuestionSubmissionMethod = asyncHandler(async(req, res) => { 
    const { questionId, isCorrect, questionNumber , responseType, topic, section, exam , level , calculatorUse, subtopic , retryCount, isHintViewed, isAnswerViewed, source, timeTaken } = req.query
   const userId  = req.user._id // this _id is from _id from socials-login database in mongoDB
  //  console.log("userId: " ,userId) 
  //  console.log("req.user._id :", userId)
    
    
    // post requests have req.body not req.query
  //  if(!questionId || !userId || !isConnect || !questionNumber || !responseType){ 
    //    throw new apiError( 400, "missing Required Parameter: one of required parameter was not receieved by the express server")
  //  }
  
    const response = await MathsQuestionSubmissionModel.create({ 
        questionId, 
        userId, 
        isCorrect ,
        questionNumber, 
        responseType, 
        topic, 
        section , 
        exam , 
        level , 
        calculatorUse, 
        subtopic, 
        retryCount , 
        isHintViewed, 
        isAnswerViewed, 
        source, 
        timeTaken
      })

    return res.status(200).json(
         new apiResponse(200, `${userId} submitted in mathsQuestionSubmissionModel with unique submission Id ${response._id}`, "maths questionSubmission done successfully")
      )



})

