import {asynchandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { response } from "express"

const genrateAccessAndRefreshTokens = async(userId)=>{
   try {
      const user = await User.findById(userId);
     const accessToken= user.generateAccessToken();
    const refreshToken= user.generateRefreshToken();

    user.refreshToken = refreshToken;
   await user.save({validateBeforeSave:false})

    return{accessToken,refreshToken}
   } catch (error) {
      throw new ApiError(500,"Something went wrong while genrating a token")
   }
}




const registerUser = asynchandler(async(req,res)=>{

   //Steps to think ,to register user

   //1 get user details from frontend
   //2 validation (not empty)
   //3 check if user already exist :username ,email
   //4 check for images ,check for avatar
   //5 upload them to cloudinary ,avatar
   //6 remove password & refresh token field from response
   //7 check for user creation
   //8 return res



   //1
 
   const {fullName,email,username,password} = req.body
   

   //2
   if([fullName,email,username,password].some((field)=>field?.trim()==="")){
      //some is method it here checks for each field that field is empty or what
      throw new ApiError(400,"All field is required ")
   }


   //3
   const existedUser =  await User.findOne({
      $or :[{username,email}]
   })
   if(existedUser){
      throw new ApiError(409,"User with these email or username already existed")
   }

 console.log(req.files)
   //4
   const avtarLocalpath = req.files?.avatar[0]?.path
 
   let coverImageLocalpath 
   if( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage){
       coverImageLocalpath = req.files?.coverImage[0]?.path
   }

   if(!avtarLocalpath){
      throw new ApiError(400,"Avtar file is required")
   }


   //5
  const avatar = await uploadOnCloudinary(avtarLocalpath)
  const coverImage = await uploadOnCloudinary(coverImageLocalpath)
  if(!avatar){
   throw new ApiError(400,"Avtar file is required")}


   //6
  const user = await User.create({
      fullName,
      avatar:avatar.url,
      coverImage:coverImage.url||"",
      email,
      password,
      username: username.toLowerCase()
   })

   //7
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )
   if(!createdUser){
      throw new ApiError(500,"something went wrong while registering a user")
   }


   //8
   return res.status(201).json(
      new ApiResponse (200,createdUser,"User registered Successfully")
   )
})

const loginUser = asynchandler(async(req,res)=>{
   
   //1 req.body - data;

   const {username,email,password} = req.body

   //2 username or email

   if(!username && !email){
      throw new ApiError(400,"username or email is required")
   }

   //3 find the user
   const user =  await User.findOne({
      $or:[{username},{email}]
   })

   if(!user){
      throw new ApiError(404,"user does not exist")
   }
  
   //4 Password Check

   const isPasswordValid = await user.isPasswordCorrect(password);

   if(!isPasswordValid){
      throw new ApiError(401,"Invalid User Credentials")
   }
   
   //5 Access & Refresh Token
   const {accessToken,refreshToken} = await genrateAccessAndRefreshTokens(user._id)

   const loggedinUser =  await User.findById(user._id).select("-password -refreshToken")
   
   //6 Send Cookie

   const Options = {
      httpOnly:true,
      secure:true
   }

   
   
 return  res.status(200)
   .cookie("accessToken" , accessToken,Options)
   .cookie("refreshToken" ,refreshToken,Options)
   .json(
      new ApiResponse(
         200,
         {
            user :loggedinUser,accessToken,refreshToken
         },
         "User loggedIn Successfully"
      )
   )
})

const logoutUser = asynchandler(async(req,res)=>{

   await User.findByIdAndUpdate(
      req.user._id,
      {
          $set :{
            refreshToken:undefined
          }
      },
      {
         new:true
      }
   )
   const Options = {
      httpOnly:true,
      secure:true
   }

   return res
   .status(200)
   .clearCookie("accessToken",Options)
   .clearCookie("refreshToken",Options)
   .json( new ApiResponse(200,{},"User Loged Out"))
})

const refreshAccessToken = asynchandler(async(req,res)=>{

   const incomingRefrehToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefrehToken){
      throw new ApiError(401,"Unauthorized access")
   }

try {
      const decodedToken = jwt.verify(
         incomingRefrehToken,
         process.env.REFRESH_TOKEN_SECRET
      )
      const user =  await User.findById(decodedToken?._id)
   
      if(!user){
         throw new ApiError(401,"Invalid refresh token")
      }
      if(incomingRefrehToken!==user?.refreshToken){
         throw new ApiError(401,"Refresh token is expired or used")
      }
      const Options ={
         httpOnly:true,
         secure:true,
      } 
   
      const { accessToken,newRefreshToken} = await genrateAccessAndRefreshTokens(user._id);
   
      return res
      .status(200)
      .cookie("accesToken",accessToken,Options)
      .cookie("refreshToken", newRefreshToken,Options)
      .json(
        new ApiResponse(200,
         {accessToken,
         refreshToken: newRefreshToken}
        )
   
        
      )
} catch (error) {
   throw new ApiError(401,error?.message||"Invalid refresh token")
}

   
})

const changeCurrentPassword = asynchandler(async(req,res)=>{
   
   const{oldPassword,newPassword}= req.body
   
   const user = await User.findById(req.user?._id)
    
   const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
      throw new ApiError(400,"Invalid password")
   }

   user.password = newPassword
   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(new ApiResponse(200,{},"Password has changed succesfully"))
})

const getCurrentUser = asynchandler(async(req,res)=>{

   return res.
   status(200)
   .json(200,req.user,"Current user fetched Succesfully")
})

const updateAccountDetails = asynchandler(async(req,res)=>{

   const {fullName,email} = req.body

   if(!(fullName||email)){
      throw new ApiError(400,"All fields are required")
   }

   const user = await User.findByIdAndUpdate(
     req.user?._id,
     {
      $set :{
         fullName:fullName,
         email :email
      }

      
     },
      {new :true}
   ).select("-password")

return res
.status(200)
.json(new ApiResponse(200,"Account details updated succesfully"))
})
const  uptadteUserAvatar  = asynchandler(async(req,res)=>{

   const avatarLocalpath = req.files?.path

   if(!avatarLocalpath){
      throw new ApiError(400,"Avatar  file is missing")
       }

       const avatar = await uploadOnCloudinary(avatarLocalpath)
       if(!avatar.url){
         throw new ApiError(400,"Error while uploading ")
       }

       const user = await User.findByIdAndUpdate(
         req.user?._id,
         {
            $set:{
               avatar :avatar.url
            }
         },
         {new:true}

       ).select("-password")

       return res
       .status(200)
       .json(new ApiResponse(200,user,"Avatar has set succesfully"))

})
const updateUserCoverImage = asynchandler(async(req,res)=>{

   const coverImageLocalpath = req.file.path;

   if(!coverImageLocalpath){
      throw new ApiError(400,"CoverImage is missing");
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalpath);

   if(!coverImage.url){
      throw new ApiError(400,"Error While Uploading Coverimage")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,

      {
         $set :{
            coverImage:coverImage.url
         }
      },
      {
         new:true
      }
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(  200,user,"Coverimage changes succesfully"))
})

const getUserChannelProfile = asynchandler(async(req,res)=>{
   const {username}= req.params

   if(!username?.trim()){
      throw new ApiError(400,"Username is missing")
   }
   const channel = await User.aggregate(
      [
         {
            $match:{
               username:username?.toLowerCase()
            }
         },{
            $lookup:{
              from: "subscriptions",
              localField:"_id",
              foreignField:"channel",
              as:"subscribedTo"
            }
         },{
            $addFields :{
               subscribersCount :{
                  $size:"$subscribers"
               },
               channelSubscribedToCount :{
                  $size:"$subscribedTo"
               },
               isSubscribed :{
                  $cond :{
                     if :{$in :[req.user?._id,"$subscribers.subscriber"]},
                     then:true,
                     else:false
                  }
               }
            }
         },{
            $project :{
               fullName:1,
               username:1,
               subscribersCount:1,
               channelSubscribedToCount:1,
               isSubscribed:1,
               avatar:1,
               coverImage:1,
               email:1
            }
         }
        
         
      ]
   )

   if(!channel?.length){
      throw new ApiError(404,"channel does not exist")
   }

   return res
   .status(200)
   .json(
      new ApiResponse(
         200, channel[0],"user Channel Fetched Succesfully"
      )
   )
})
const getWatchHistory = asynchandler(async(req,res)=>{
const user = await User.aggregate([
   {
      $match:{
         _id:new mongoose.Types.ObjectId(req.user._id)
      }
   },
   {
      $lookup :{
         from :"videos",
         localField:"watchHistory",
         foreignField:"_id",
         as:"watchHistory",
         pipeline :[
            {
               $lookup :{
                  from:"users",
                  localField:"owner",
                  foreignField:"_id",
                  as:"owner",
                  pipeline :[
                     {
                        $project :{
                         fullName:1,
                         username :1,
                        avatar:1,
                        }
                     }
                  ]
               }
            }
         ]
      }
   },
   {
      $addFields :{
         owner :{
            $first :"$owner"
         }
      }
   }
])

return res
.status(200)
.json(
   new ApiResponse(
      200,user[0].watchHistory,"watch history  fetched Succesfully"
   )
)
})
export { registerUser
   ,loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   uptadteUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile,
   getWatchHistory
}


