import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { Notification } from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";
import {Post} from "../models/post.model.js"

const createPost=asyncHandler(async(req,res,next)=>{
    try {
        const {text}=req.body
        let {img}=req.body
        const userId=req.user._id
        
        const user=await User.findById(userId);
        if(!user){
            throw new ApiError(400,"user not found in the database")
        }

        if(!text && !img){
            throw new ApiError(400,"The post must have either a post or text")
        }

        if(img){
            const uploadedResponse=await cloudinary.uploader.upload(img);
            img=uploadedResponse.secure_url
        }

        const newPost = new Post({
			user: userId,
			text,
			img,
		});

		await newPost.save();

        return res
        .status(200)
        .json(new ApiResponse(200,newPost,"Post created successfully"))
    } catch (error) {
        console.error("Error in createPost controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));
    }
})

const deletePost=asyncHandler(async(req,res,next)=>{
    try {
        const postId=req.params.id
        if(!postId){
            throw new ApiError(400,"Post id is required")
        }
    
        const post = await Post.findById(postId)
        if(!post){
            throw new ApiError(400,"Postv not found in the database")
        }
    
        if(post.user.toString()!==req.user._id.toString()){
            throw new ApiError(400,"Unauthorized request")
        }
    
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
    			await cloudinary.uploader.destroy(imgId);
        }
    
        await Post.findByIdAndDelete(postId)
    
        return res
        .status(200)
        .json(new ApiResponse(200,"","Post deleted succesfully"))
    } catch (error) {
        console.error("Error in deletePost controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));
    }
})

const commentOnPost=asyncHandler(async(req,res,next)=>{
    try {
        const {text}=req.body
        const postId=req.params.id
        const userId=req.user._id
    
        if(!postId){
            throw new ApiError(400,"The post id is required")
        }
    
        if(!text){
            throw new ApiError("The text field is required")
        }
    
        const post=await Post.findById(postId)
        if(!post){
            throw new ApiError(400,"Post doesn't exist")
        }

        const comment={user:userId,text}
        post.comments.push(comment);
        await post.save()

        return res
        .status(200)
        .json(new ApiResponse(200,post,"Comment added successfully to the post"))
    } catch (error) {
        console.error("Error in commentOnPost controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));
    }
})

const likeUnlikePost=asyncHandler(async(req,res,next)=>{
    try {
        const userId = req.user.id;
        const { id: postId } = req.params;
    
        if (!postId) {
            throw new ApiError(400, "Post id is required");
        }
    
        const post = await Post.findById(postId);
        if (!post) {
            throw new ApiError(400, "The post not found in the database");
        }
    
        const userLikedPost = post.likes.includes(userId);
    
        if (!userLikedPost) {
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
            await post.save();
    
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
            });
            await notification.save();
    
            const updatedLikes = post.likes;
            return res
                .status(200)
                .json(new ApiResponse(200, updatedLikes, "Post liked successfully"));
        }
    
        await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
        await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
    
        const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
    
        res.status(200).json(new ApiResponse(200, updatedLikes, "Post unliked successfully"));
    } catch (error) {
        console.error("Error in likeUnlikePost controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));
    }    
})
export {
    createPost,
    deletePost,
    commentOnPost,
    likeUnlikePost,
}