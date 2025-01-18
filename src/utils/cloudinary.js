import {v2 as cloudinary} from "cloudinary"
import  fs from "fs"
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});
const uploadOnCloudinary = async(localfilepath)=>{
    try {
        if(!localfilepath) return null;
        //upload the file in cloudinary
     const response  =   await cloudinary.uploader.upload(localfilepath,{
            resource_type :"auto"
        })
        //file has been uploaded succesfuly;
        console.log("file is uploaded on cloudinary")
         return response
    } catch (error) {
        fs.unlinkSync(localfilepath) 
        //remove the locally saved temprory file  as the upload opretion got failed;
        return null;
    }
}
export {uploadOnCloudinary}
