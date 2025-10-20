import express from "express"
import { app } from "./app.js"
import { mongoDBconnect } from "./models/dbConnections.js"


mongoDBconnect()
// console.log(process.env.PORT)
try{
    app.listen(process.env.PORT || 8000, () => {
    
        console.log(`sever is running at port:${process.env.PORT}`)
    })

}catch(error){
    console.log("server did not start encountered an error: ", error)
}

