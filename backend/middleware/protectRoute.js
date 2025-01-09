import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const protectRoute =async(req,res,next)=>{
    try {
        const token = req.cookies?.jwt;

        if (!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        if (!decoded) {
            throw new ApiError(401, "Unauthorized: Invalid token");
        }
    
        const user = await User.findById(decoded.userId).select("-password");
    
        if (!user) {
            throw new ApiError(404, "User not found in the database");
        }
    
        req.user = user; 
        next(); 
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));
    }
}