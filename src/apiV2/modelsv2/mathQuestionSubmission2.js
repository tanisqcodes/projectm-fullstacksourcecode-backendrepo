import mongoose from "mongoose"

const MathQuestionSubmissionSchema2 = new mongoose.Schema( { 
    questionId: { 
        type: string, required:true
    },
    userId: { 
        type: string, required:true
    },
    attemptId: { //Id.unique()
        type: string, required:true
    },
    isHintViewed: { 
        type: string, required:true
    },
    isAnswerViewed: { 
        type: string, required:true
    },
    isCorrect: { 
        type: string, required:true
    },
    retryCount: { 
        type: string, required:true
    },
    timeTakenInMin: { 
        type: string, required:true
    },
    timeTakenInSec: { 
        type: string, required:true
    },
    timeTakenInSecHint: { 
        type: string, required:true
    },
    timeTakeninMinHint: { 
        type: string, required:true
    },
    attemptMode: { 
        type: string, required:true
    },
    // questionObjectDetails
    calculatorUse: { 
        type: boolean, required:true
    },
    exam: { 
        type: string, required:true
    },
    level: { 
        type: string, required:true
    },
    questionNumber: { 
        type: string, required:true
    },
    responseType: { 
        type: string, required:true
    },
    section: { 
        type: string, required:true
    },
    chatperNumber: { 
        type: string, required:true
    },
    topic: { 
        type: string, required:true
    },


}, {timestamps: true})
export const MathQuestionSubmissionModel2 = mongoose.model(math-question-submission-2, MathQuestionSubmissionSchema2)