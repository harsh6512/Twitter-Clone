import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const getUserProfile=asyncHandler(async(req,res,next)=>{
    const {username}=req.params;

    try{
        const user=await User.findOne({username}).select("-password")

        if(!user){
            throw new ApiError(400,"User not found")
        }

        return res
        .status(200)
        .json(new ApiResponse(200,user,"User profile fetched successfully"))
    }
    
    catch(error){
        console.error("Error in getUserProfile controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));
    }
})

const followUnfollowUser=asyncHandler(async(req,res,next)=>{
   try {
     const {id}=req.params
     if(!id){
         throw new ApiError(400,"user id is required")
     }
 
     const userToFollow=await User.findById(id)
     const currentUser=await User.findById(req.user._id)
 
     if(id==req.user._id.toString()){
         throw new ApiError(400,"You cannot follow yourself")
     }
 
     if(!userToFollow || !currentUser){
         throw new ApiError(400,"user not found")
     }
 
     const isFollowing=currentUser.following.includes(id);

     if(isFollowing){
        // if the user is already following the user we need to unfollow it

        await User.findByIdAndUpdate(id,{$pull:{
            followers:req.user._id
        }})

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { following: id } },
            { new: true }
        )

        return res 
        .status(200)
        .json(new ApiResponse(200,updatedUser,"User unfollowed succesfully"))
     }   
     //follow the user
     await User.findByIdAndUpdate(id,{
        $push:{
            followers:req.user._id
        }
     })

     const updatedUser=await User.findByIdAndUpdate(req.user._id,{ $push: 
        { following: id } 
    },{new:true});

    return res
    .status(200)
    .json(new ApiResponse(200,updatedUser,"User followed successfully"))
   } catch (error) {
    console.error("Error in followUnfollow controller", error.message);
    return next(new ApiError(500, error.message || "Internal server error"));
   }
})

export {
    getUserProfile,
    followUnfollowUser,
}