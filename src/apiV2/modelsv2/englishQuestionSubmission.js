import mongoose from "mongoose"
const EnglishQuestionSubmissionSchema = new mongoose.Schema({ 
    questionId: { 
        type:String, required: true
    }, 
    userId: { 
        type: String, required: true
    }, 
    isCorrect:{ 
        type: Boolean, required: true
    },
    exam:{ 
        type: String, required: true
    }, 
    level: { 
        type: String, required: true
    }, 
    questionNumber: { 
        type: String , required: true
    }, 
    moduleNumber: { 
        type: String, required: true
    }, 
    questionTypeNumber: { 
        type: String , required: true
    }, 
    uniqueSubmissionId: { 
        type: String , required: true
    }








}, {timestamps: true})
export const englishQuestionSubmissionModel = mongoose.model('EnglishQuestionSubmissionModelRemote', EnglishQuestionSubmissionSchema)