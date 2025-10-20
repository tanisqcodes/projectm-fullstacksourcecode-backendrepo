import { asyncHandler } from "../utils/asyncHandler.js";
import pkg from "jsonwebtoken"
const {sign , verify} = pkg; 

export const verifyJWT = asyncHandler( 
    async (req, res, next) => { 
        console.log("verifyJWT middleware ran")
        const token  = req.query.token;
        if(!token){ 
            return res.status(401).json({
                message: "no token provided"
            })
        }
        
            const decodedToken = verify(token , process.env.JWT_SECRET)
            if(!decodedToken) return res.status(403).json({ 
                message: "invalid or expired Token"
            })
            req.user = decodedToken
            // you can add decoded token in req, if you want later
            next();
        

            
        }

    
)