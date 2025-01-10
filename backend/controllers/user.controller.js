import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { Notification } from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

const getUserProfile = asyncHandler(async (req, res, next) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).select("-password")

        if (!user) {
            throw new ApiError(400, "User not found")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, user, "User profile fetched successfully"))
    }

    catch (error) {
        console.error("Error in getUserProfile controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));
    }
})

const followUnfollowUser = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params
        if (!id) {
            throw new ApiError(400, "user id is required")
        }

        const userToFollow = await User.findById(id)
        const currentUser = await User.findById(req.user._id)

        if (id == req.user._id.toString()) {
            throw new ApiError(400, "You cannot follow yourself")
        }

        if (!userToFollow || !currentUser) {
            throw new ApiError(400, "user not found")
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // if the user is already following the user we need to unfollow it

            await User.findByIdAndUpdate(id, {
                $pull: {
                    followers: req.user._id
                }
            })

            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                { $pull: { following: id } },
                { new: true }
            )

            return res
                .status(200)
                .json(new ApiResponse(200, updatedUser, "User unfollowed succesfully"))
        }
        //follow the user
        await User.findByIdAndUpdate(id, {
            $push: {
                followers: req.user._id
            }
        })

        await Notification.create({
            type: "follow",
            from: req.user._id,
            to: userToFollow._id,
        });

        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            $push:
                { following: id }
        }, { new: true });

        return res
            .status(200)
            .json(new ApiResponse(200, updatedUser, "User followed successfully"))
    } catch (error) {
        console.error("Error in followUnfollow controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));
    }
})

const getSuggestedUsers = asyncHandler(async (req, res, next) => {
    try {
        const userId=req.user._id
        
        const usersFollowedByMe=await User.findById(userId).select("following")
    
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                },
            },
            { $sample: { size: 10 } },
        ]);
    
        const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);
    
        suggestedUsers.forEach((user) => (user.password = null));
    
        res
        .status(200)
        .json(200,suggestedUsers,"User suggested successfully")
    
    } catch (error) {
        console.error("Error in getSuggestedUser controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));
    }
})

const updateUser = asyncHandler(async (req, res, next) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body
    let { profileImg, coverImg } = req.body

    const userId = req.user._id
    try {
        let user = await User.findById(userId)
        if (!user) {
            throw new ApiError(400, "The user not found in the database")
        }

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            throw new ApiError(400, "Please provide both current password and new password")
        }

        if (currentPassword && newPassword) {
            const isMatch = await user.isPasswordCorrect(currentPassword)
            if (!isMatch) {
                throw new ApiError(400, "Your current password is incorrect")
            }
            if (newPassword.length < 6) {
                throw new ApiError(400, "The new password should be of 6 character")
            }
        }

        user.password = user

        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url
        }
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            } scrollX
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url
        }
        user.fullName = fullName || user.fullName
        user.email = email || user.email
        user.username = username || user.username
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        user = await user.save()
        //this is make sure we do not send the password in the response
        user.password = null

        return res
            .status(200)
            .json(new ApiResponse(200, user, "The user details updated sucesfully"))
    } catch (error) {
        console.error("Error in updateUser controller", error.message);
        return next(new ApiError(500, error.message || "Internal server error"));
    }
})

export {
    getUserProfile,
    followUnfollowUser,
    getSuggestedUsers,
    updateUser,
}