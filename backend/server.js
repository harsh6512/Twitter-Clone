import express from "express";
import authRoutes from "./routes/auth.routes.js"
import dotenv from "dotenv"
import connectDB from "./db/connectMongoDb.js";

dotenv.config()
const app=express()


app.use(express.json());
app.use("/api/auth",authRoutes)
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

connectDB()
.then(()=>{
     app.listen(process.env.PORT || 8000,()=>{
        console.log(`The server is running at the PORT ${process.env.PORT}`)
     })
})
.catch((error)=>{
    console.log("Mongo db connection failed",error)
})

