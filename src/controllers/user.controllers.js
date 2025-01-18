import {asynchandler} from "../utils/asynchandler.js"
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asynchandler(async(req,res)=>{

   //Steps to thnk to register user

   //1 get user details from frontend
   //2 validation (not empty)
   //3 check if user already exist :username ,email
   //4 check for images ,check for avatar
   //5 upload them to cloudinary ,avatar
   //6 remove password & refresh token field from response
   //7 check for user creation
   //8 return res

 
   const {fullName,email,name,password} = req.body

   //some is method it here checks for each field that field is empty or what

   if([fullName,email,username,password].some((field)=>field?.trim()==="")){
      throw new ApiError(400,"All field is required ")
   }

   const existedUser = User.findOne({
      $or :[{username,email}]
   })
   if(existedUser){
      throw new ApiError(409,"User with these email or username already existed")
   }
   const avtarLocalpath = req.files?.avatar[0]?.path
   const coverImageLocalpath = req.files?.coverImage[0]?.path

   if(!avtarLocalpath){
      throw new ApiError(400,"Avtar file is required")
   }

  const avatar = await uploadOnCloudinary(avtarLocalpath)
  const coverImage = await uploadOnCloudinary(coverImageLocalpath)

  if(!avatar){
   throw new ApiError(400,"Avtar file is required")}

  const user = await User.create({
      fullName,
      avatar:avatar.url,
      coverImage:coverImage.url||"",
      email,
      password,
      username:username.toLowerCase(),

   })
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if(!createdUser){

      throw new ApiError(500,"something went wrong while registering a user")

   }

   return res.status(201).json(
      new ApiResponse (200,createdUser,"User registered Successfully")
   )
})

export {registerUser}


