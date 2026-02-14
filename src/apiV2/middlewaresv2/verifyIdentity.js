// this is the middleware that will verify wether the request is coming from 
// the verified user from nextjs frontend
import {createClient} from "@supabase/supabase-js"
import { apiResponse } from "../../utils/apiResponse.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
function getSupabaseAccessToken(req){         
    const cookieKeys = Object.keys(req.cookies)
  
    const tokenParts = cookieKeys
      .filter(k => k.includes("-auth-token."))
      .sort() // .0, .1, .2 ...
      .map(k => req.cookies[k])
  
    if (tokenParts.length === 0) return null
  
    const raw = tokenParts.join("")
  
    // Supabase stores base64-encoded JSON
    const decoded = JSON.parse(
      Buffer.from(raw.replace("base64-", ""), "base64").toString("utf8")
    )
  
    return decoded.access_token
  }
  
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_ANON_KEY
)




export const VerifyIdentity= asyncHandler(async(req, res, next) => { 
  console.log("method verifyIdentity ran")


  const accessToken = getSupabaseAccessToken(req)
  if(!accessToken){ 
    return res.status(401).json(new apiResponse(401, {} ,"no token in request in middleware Identity Token"))
  }
  const {data: { user} , error} = await supabase.auth.getUser(accessToken)
  if( !user || error){ 
    console.log("error")
    return res.status(401).json(new apiResponse(401, { 
        "error":error
    }, 
" either then user does not exists or there is an error"))
  }
  if(user){ 
   // console.log(user)
    req.user = user;
    req.userId= user.id
    next()
  }
})