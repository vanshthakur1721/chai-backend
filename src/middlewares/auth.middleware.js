import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asynchandler(async (req,res,next) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();

        console.log("Extracted Token:", token); // Debugging

        if (!token) {
            throw new ApiError(401, "Unauthorized request: Token is missing");
        }

        // Verify token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            console.error("JWT Verification Error:", err.message);
            throw new ApiError(401, "Malformed or Invalid Token");
        }

        // Find user by ID
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid Access Token: User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication Middleware Error:", error.message);
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});
