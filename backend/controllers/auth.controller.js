import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const signup=asyncHandler(async(req,res)=>{
   try {
    const {fullName,username,email,password}=req.body

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const emailRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        throw new ApiError(200,"Invalid email format")
    }
    
   } catch (error) {
    
   }
})

const login=async(req,res)=>{
    res.json({
        data:"this is the login endpoint"
    })
}

const logout=async(req,res)=>{
    res.json({
        data:"this is the signup endpoint"
    })
}

export {
    login,
    logout,
    signup
}