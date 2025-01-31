import { Router } from "express";
import {registerUser,loginUser,logoutUser,
    refreshAccessToken,changeCurrentPassword,updateAccountDetails,uptadteUserAvatar,updateUserCoverImage,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory
} from '../controllers/user.controllers.js'
import{
    publishAVideo
} from "../controllers/video.controller.js"
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'

const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ])
    ,registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post( verifyJWT ,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change_password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avtar"),uptadteUserAvatar)
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)
router.route("/publishvideo").post(verifyJWT,publishAVideo)
export default router