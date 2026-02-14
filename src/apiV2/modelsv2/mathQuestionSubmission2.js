import mongoose from "mongoose"

const MathQuestionSubmissionSchema2 = new mongoose.Schema( { 
    questionId: { 
        type: String, required: true
    },
    userId: { 
        type: String, required: true
    },
    attemptId: { //Id.unique()
        type: String, required: true
    },
    isHintViewed: { 
        type: String, required: true
    },
    isAnswerViewed: { 
        type: String, required: true
    },
    isCorrect: { 
        type: String, required: true
    },
    retryCount: { 
        type: String, required: true
    },
    timeTakenInMinAnswer: { 
        type: String, required: true
    },
    timeTakenInSecAnswer: { 
        type: String, required: true
    },
    timeTakenInSecondsAnswer: {   // only in seconds
        type:String, required: true
    },
    timeTakenInSecHint: { 
        type: String, required: true
    },
    timeTakenInMinHint: { 
        type: String, required: true
    },
    timeTakenInSecondsHint: {  // only in seconds
        type: String, required: true
    },
    attemptMode: { 
        type: String, required: true
    },
    // questionObjectDetails
    calculatorUse: { 
        type: String, required: true
    },
    exam: { 
        type: String, required: true
    },
    level: { 
        type: String, required: true
    },
    questionNumber: { 
        type: String, required: true
    },
    responseType: { 
        type: String, required: true
    },
    section: { 
        type: String, required: true
    },
    chapterNumber: { 
        type: String, required: true
    },
    topic: { 
        type: String, required: true
    },
   uniqueSubmissionId: { 
        type:String, required: true
    }, 
   

}, {timestamps: true})
export const MathQuestionSubmissionModel2 = mongoose.model("MathQuestionSubmissionModelRemote2", MathQuestionSubmissionSchema2)