import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {generateTokenAndSetCookie} from "../utils/generateToken.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const signup = asyncHandler(async (req, res, next) => {
    try {
        const { fullName, username, email, password } = req.body;

        if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
            return next(new ApiError(400, "All fields are required"));
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return next(new ApiError(400, "Invalid email format"));
        }

        const existedUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (existedUser) {
            return next(new ApiError(409, "User with given email or username already exists"));
        }

        if (password.length < 6) {
            return next(new ApiError(400, "The password must be at least 6 characters long"));
        }

        const newUser = await User.create({
            fullName,
            username,
            email,
            password,
        });

        const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

        if (!createdUser) {
            return next(new ApiError(500, "Something went wrong while registering the user"));
        }

        generateTokenAndSetCookie(newUser._id, res);

        res.status(201).json(new ApiResponse(200, createdUser, "User created successfully"));
    } catch (error) {
        console.error("Error in signup controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));
    }
});


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