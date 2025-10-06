import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import axios from "axios"
import { UserModel } from "../models/userModel.js"
import { oauth2client } from "../utils/googleConfig.js"
import jwt from "jsonwebtoken"
/* export const authMethod = asyncHandler( async(req, res) => { 
     const number = req.query.number
return res.status(200).json( new apiResponse(200 , { 
    "hello" : "hello", 
    "hellofuckyou" : "hao"
}, `done right ${number}`))
})
*/ 
 export const googleLogin = asyncHandler(
    async(req, res) => { 
        console.log("method ran for /user/auth/google")
        const {code} = req.query; 
       
        const googleRes = await oauth2client.getToken(code);

        oauth2client.setCredentials(googleRes.tokens);
        const userRes = await axios.get( 
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        )
       //  console.log("userRes: ", userRes)
const {email, name } = userRes.data
let user = await UserModel.findOne({email})
if( !user){ 
    user = await UserModel.create({ 
        name, email
    })
}
const {_id} = user // extracting id from user object 
const token =  jwt.sign( { 
    _id , email
},   
process.env.JWT_SECRET || '74649946afb640c67573e5d8ad2ba274',
{ 
    expiresIn: process.env.JWT_TIMEOUT || '7d'
})
 return res.status(200).json(
    {
        message: "success", 
        token, 
        user
    }
 )

    }
)

export const authtest = asyncHandler( 
    async(req, res) => { 
        return res.send("yes route is working and so is /user/auth/test")
    }
)