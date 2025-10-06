// this is the model for social logins
// this is mongodb model for google 
// social login
// checklist : mongo database login for this

import mongoose from "mongoose"
const DB_URL = process.env.DB_URL
export const mongoDBconnect = () => {
mongoose.connect(DB_URL)
.then(() => { 
    console.log("MongoDB is connected successfully")
}).catch(
    (error) => { 
        console.log("database connection with mongoDB failed error is: ", error)

    }
)
}