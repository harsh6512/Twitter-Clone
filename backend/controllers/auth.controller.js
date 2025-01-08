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

        const createdUser = await User.findById(newUser._id).select("-password");

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


const login=async(req,res,next)=>{
   try {
     const {username,password}=req.body
     if(!username || !password){
         throw new ApiError(400,"Both username and password is required")
     }
    
     const user = await User.findOne({ username })
     if(!user){
        throw new ApiError(400,"user with the given username is not found")
     }

     const isPasswordValid = await user.isPasswordCorrect(password)
     if(!isPasswordValid){
        throw new ApiError(401,"invalid user credentials")
     }

     const userDetails=await User.findById(user._id).select("-password");
     if(!userDetails){
        throw new ApiError(500,"unable to fetch the user data at the moment")
     }

     generateTokenAndSetCookie(user._id, res);

     return res
     .status(200)
     .json(new ApiResponse(200,userDetails,"User logged in successfully"))

   } catch (error) {
    console.error("Error in login controller", error.message);
    return next(new ApiError(500, error.message || "Internal server error"));
   }

}

export const logout = async (req, res,next) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res
        .status(200)
        .json(new ApiResponse(200,"","User looged out successfully"));
	} catch (error) {
		console.log("Error in logout controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));	}
};

export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res
        .status(200)
        .json(new ApiResponse(200,user,"user details fetched successfully"));
	} catch (error) {
		console.log("Error in getMe controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));	}
};

export {
    login,
    logout,
    signup
}