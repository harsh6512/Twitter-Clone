import { ApiError } from "../utils/ApiError.js"

const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Something went wrong",
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};

export default errorHandler;