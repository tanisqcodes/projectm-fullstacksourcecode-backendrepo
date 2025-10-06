import mongoose from "mongoose"
const UserSchema = new mongoose.Schema(
    { 
        name : { 
            typeof: String
        }, 
        email: { 
            type: String
        }, 
       
    }
)
export const UserModel = mongoose.model('social-logins', UserSchema)
