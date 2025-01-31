import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asynchandler} from "../utils/asynchandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asynchandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if([title,description].some((field)=>field?.trim()==="")){
        //some is method it here checks for each field that field is empty or what
        throw new ApiError(400,"All field is required ")
     }
const thumbnaillocalpath = req.files?.thumbnail[0]?.path
if(!thumbnaillocalpath){
    throw new ApiError(400,"there is no thumbnail file")
}
const thumbnail = await uploadOnCloudinary(thumbnaillocalpath)
if(!thumbnail){
    throw new ApiError(400,"Please first upload thumbnail")
}
    const videolocalpath = req.files?.Video[0]?.path
    if(!videolocalpath){
        throw new ApiError(400,"video is missing")
    }
    const video = await uploadOnCloudinary(videolocalpath);
    if(!video){
        throw new ApiError(400,"video file is missing")
    }
    const  videodata = Video.create({
        title,
        description,
        thumbnail: thumbnail.url,
        Video:video.url,
        owner: req.user._id,
        duration: filePath.duration||  0,
        views: filePath.views || 0,
        isPublished: false,
        
    })
    const createdVideo = await Video.findById(videodata._id)
    if(!createdVideo){
        throw new ApiError(500,"something went wrong while creating a vidoe")
     }

return res
.status(201).json(new ApiResponse(200,videodata,"video published succesfully"))
})

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}