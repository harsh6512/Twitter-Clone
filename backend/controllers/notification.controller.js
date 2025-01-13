import {Notification} from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const getNotifications = asyncHandler(async (req, res, next) => {
	try {
		const UserId = req.user._id;
		if (!UserId) {
			throw new ApiError(400, "User id is required")
		}

		const notifications = await Notification.find({ to: UserId }).populate({
			path: "from",
			select: "username profileImg"
		})

		if (notifications.length === 0) {
			return res
				.status(200)
				.json(new ApiResponse(200, "", "No new notifications"))
		}

		await Notification.updateMany({ to: UserId }, { read: true });

		return res
			.status(200)
			.json(new ApiResponse(200, notifications, "User notifications fetched successfully"))
	} catch (error) {
		console.error("Error in getNotifications controller", error.message);
		return next(new ApiError(500, error.message || "Internal server error"));
	}
})

const deleteNotifications = asyncHandler(async (req, res, next) => {
	try {
		const userId = req.user._id
		if (!userId) {
			throw new ApiError(400, "User id is required ")
		}

		const deleteResult = await Notification.deleteMany({ to: userId });

		if (deleteResult.deletedCount === 0) {
			return res
				.status(404)
				.json(new ApiResponse(404, "", "No notifications found to delete"));
		}

		return res
			.status(200)
			.json(new ApiResponse(200, "", "Notifications deleted successfully"))
	} catch (error) {
		console.error("Error in deleteNotifications controller", error.message);
		return next(new ApiError(500, error.message || "Internal server error"));
	}
})

export {
	getNotifications,
	deleteNotifications,
}