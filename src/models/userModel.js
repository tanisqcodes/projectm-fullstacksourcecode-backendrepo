import mongoose from "mongoose"
const UserSchema = new mongoose.Schema( 
    { 
        name : { 
            type: String
        }, 
        email: { 
            type: String
        }, 
       
    }
)
export const UserModel = mongoose.model('social-logins', UserSchema)
