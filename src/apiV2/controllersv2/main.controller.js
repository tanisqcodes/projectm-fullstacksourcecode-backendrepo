import {Client, Query , TablesDB, Storage, ID} from "appwrite"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { apiError } from "../../utils/apiError.js"
import { apiResponse } from "../../utils/apiResponse.js"
import { MathsQuestionSubmissionModel } from "../../models/mathsQuestionSubmissions.js"
import express from "express"
import { MathQuestionSubmissionModel2 } from "../modelsv2/mathQuestionSubmission2.js"

const appwriteDatabaseId = process.env.APPWRITE_DATABASE_ID
const satMathKaplanCollectionId = process.env.SAT_MATH_KAPLAN_COLLECTION_ID
const satEnglishCollectionId = process.env.SAT_ENGLISH_COLLECTION_ID
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
    console.log("getquestion2 ran")
   
     const { chapterNumber , questionNumber } = req.query
   // console.log(appwriteDatabaseId)
     const questionObject = await tablesDB.listRows({
        databaseId: appwriteDatabaseId, 
        tableId : satMathKaplanCollectionId,
        queries: [
            Query.equal('questionNumber', questionNumber) , 
            Query.equal('subtopic',`chapter ${chapterNumber}`)

        ] 
            
     });
    
   // console.log(questionObject.rows[0])
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
            questionId, isHintViewed, isAnswerViewed, 
            isCorrect, retryCount , timeTakenInMinAnswer, timeTakenInSecAnswer, 
            timeTakenInSecHint, timeTakenInMinHint , attemptMode, calculatorUse, exam  ,
            level, questionNumber, responseType, section, topic , attemptId, chapterNumber
        } = req.body
        const {userId} = req
        const uniqueSubmissionId= ID.unique()
        console.log(timeTakenInMinHint)
        // everything is not with us


        // attemptId will be the unique seesion identifier of the user on the frontend,  also the userId will be coming from middleware 
       
     /*   console.log( questionId, userId, attemptId ,isHintViewed, isAnswerViewed, 
            isCorrect, retryCount , timeTakenInMinAnswer, timeTakenInMinAnswer, 
            timeTakenInSecHint, timeTakenInMinHint , attemptMode, calculatorUse, exam  ,
            level, questionNumber, responseType, section, chapterNumber, topic 
           
       )   
            */  
           const timeTakenInSecondsAnswer = (timeTakenInSecAnswer) + (timeTakenInMinAnswer)*60
           const timeTakenInSecondsHint = (timeTakenInSecHint) + (timeTakenInMinHint)*60
           
       const response =MathQuestionSubmissionModel2.create({ 

        questionId: questionId, userId:userId, attemptId:attemptId ,isHintViewed: isHintViewed, isAnswerViewed : isAnswerViewed, 
            isCorrect: isCorrect, retryCount: retryCount , timeTakenInMinAnswer: timeTakenInMinAnswer, timeTakenInSecAnswer: timeTakenInSecAnswer,
            timeTakenInSecHint: timeTakenInSecHint , timeTakenInMinHint: timeTakenInMinHint , attemptMode: attemptMode, calculatorUse:calculatorUse, exam: exam  ,
            level: level, questionNumber:questionNumber, responseType: responseType, section: section, chapterNumber: chapterNumber, topic: topic , uniqueSubmissionId: uniqueSubmissionId,
            timeTakenInSecondsAnswer: timeTakenInSecondsAnswer, timeTakenInSecondsHint:timeTakenInSecondsHint

       })
       console.log(response)
       return res.status(200).json(new apiResponse(200, { 
        "status" : "done"
       }, "question submitted successfully"))
      // console.log(`time for submission: ${timeTakenInMinAnswer}M ${timeTakenInSecAnswer}S`)
    // console.log(`time for loooking hint ${timeTakenInMinHint}M ${timeTakenInSecHint}S`)
    }
)










// this is the test script to extract question information about level from appwrite database
export const questionInfoExtraction = asyncHandler( async(req, res) => { 
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
      return res.status(200).json(new apiResponse(200, {stats} , "fetched successfully"))
      


})




export const getEnglishQuestion = asyncHandler(async(req, res) => { 
  const {questionNumber, moduleNumber } = req.query
  const questionObject = await tablesDB.listRows({
    databaseId: appwriteDatabaseId, 
    tableId : satEnglishCollectionId,
    queries: [
        Query.equal('questionNumber', questionNumber) , 
        Query.equal('moduleNumber', moduleNumber)

    ] 
        
 });
 if(!questionObject){
  throw new apiError(400, "question was not successfully fetched from appwrite database")

}


// write a media link giver

if(questionObject.rows[0]){ 

}
 return res.status(200).json(new apiResponse(200, { questionObject} , "english question delivered successfully"))
})