import express from "express";
import authRoutes from "./routes/auth.routes.js"
import dotenv from "dotenv"
import connectDB from "./db/connectMongoDb.js";
import cookieParser from "cookie-parser";

dotenv.config()
const app=express()


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth",authRoutes);

connectDB()
.then(()=>{
     app.listen(process.env.PORT || 8000,()=>{
        console.log(`The server is running at the PORT ${process.env.PORT}`)
     })
})
.catch((error)=>{
    console.log("Mongo db connection failed",error)
})

