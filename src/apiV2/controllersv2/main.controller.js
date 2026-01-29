import {Client, Query , TablesDB, Storage} from "appwrite"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { apiError } from "../../utils/apiError.js"
import { apiResponse } from "../../utils/apiResponse.js"
import { MathsQuestionSubmissionModel } from "../../models/mathsQuestionSubmissions.js"
import express from "express"

const appwriteDatabaseId = process.env.APPWRITE_DATABASE_ID
const satMathKaplanCollectionId = process.env.SAT_MATH_KAPLAN_COLLECTION_ID
const projectId= process.env.APPWRITE_PROJECT_ID
const bucketId = process.env.APPWRITE_BUCKET_ID
const client = new Client().setEndpoint("https://nyc.cloud.appwrite.io/v1")
.setProject(projectId)
const tablesDB  = new TablesDB(client)
const storage = new Storage(client)


/* 
you to find all these values in this method
-answerImageLink
-questionImageLink
- subtopic is chapterNumber
- there is no questionID , you can use unique identifier















*/














export const getQuestion2 = asyncHandler(async(req , res) =>  {
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
     console.log(questionObject.rows[0])
     if(!questionObject){
        throw new apiError(400, "question was not successfully fetched from appwrite database")
     }
     
        const answerImageLink =storage.getFileView({ 
            bucketId: bucketId,
            fileId: questionObject.rows[0].answerImageResponseId  // this is the answerImageResponseId
        })
        const questionImageLink =storage.getFileView({ 
            bucketId: bucketId,
            fileId: questionObject.rows[0].questionImageResponseId   // this is the answerImageResponseId
        })
            
     
     // console.log(questionObject)
     return res.status(200).json( new apiResponse(200,        
         { 
            questionObject, 
            questionImageLink, 
            answerImageLink
             //questionObject.questionImageResponseId,


         }
         , "question delivered by backend successfully"
     ))


})




export const mathQuestionSubmissionMethod2 =asyncHandler(
    async(req, res) => { 
        const { 
            questionId, userId, attemptId, isHintViewed, isAnswerViewed, 
            isCorrect, retryCount , TimeTakenInMin, timeTakenInMin, 
            timeTakenInSec,TimeTakenInSecHint, timeTakenInMinHint , attemptMode, calculatorUse, exam  ,
            level, questionNumber, responseType, section, chapterNumber, topic 
        } = req.query
    }
)