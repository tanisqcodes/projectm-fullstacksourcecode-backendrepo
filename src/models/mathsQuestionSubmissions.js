import mongoose from "mongoose"
const MathsQuestionSubmissionSchema = new mongoose.Schema( { 

    questionId: {  // this will come from appwrite questionObject
        type: String,
        required: true 
    }, 
    userId: {  // id of the user which has submitted , this will come from decoded jwt or social-logins
        type: String,
        required: true
    }, 
    isCorrect: { 
        type: Boolean,
        required: true
    }, 
    questionNumber: { 
        type: String,
        required: true
    }, 
    responseType: { 
        type: String,
        required: true
    }, 
    topic: {  //  functions , arithmetic , algebra 
        type: String
    }, 
    section: { 
        type: String
    }, 
    exam: {  // hard coded maths
        type: String
    }, 
    level: { 
        type: String
    }, 
    
    calculatorUse: { 
        type: String
    }, 
   
    subtopic: {  // this is the chapter number like 'chapter 5' or 'chapter 6'
        type: String
    }, 
    retryCount: { 
        type: Number
    },
    isHintViewed: { // was hint viewed 
        type: Boolean
    }, 
    isAnswerViewed: { // was answer viewed
        type: Boolean 
    },
    Source: {  // advanced attribute , like test , practice or what
        type: String
    }, 
    timeTakenMinutes: {  // this will represent the minute part of time taken
        type: String
    }, 
    timeTakenSeconds: { // this will represent the seconds part of minutes
        type: String
    }
    /* submittedAt: { 
        type: String
    }, 
    { timestamps: true } adds two fields updatedAt  and createdAt in each document
    
    
    */ 

    
   
    


},  { timestamps: true })
export const MathsQuestionSubmissionModel = mongoose.model('maths-question-submissions' , MathsQuestionSubmissionSchema)