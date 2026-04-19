import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});  

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        //upload the file on cludinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto',
        })
       // console.log("file is ulpoaded on cloudinary", response.url);
       fs.unlinkSync(localFilePath);//delete the file from local storage as we have uploaded it on cloudinary and we don't need it in local storage anymore
        return response;

    }
    catch(error){
        fs.unlinkSync(localFilePath);//delete the file from local storage as operation is failed
        console.log("error while uploading file on cloudinary", error);
        return null;

    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("File deleted from Cloudinary:", result);
        return result;
    } catch (error) {
        console.log("Error deleting file from Cloudinary:", error);
        return null;
    }
};

const extractPublicIdFromUrl = (url) => {
    if (!url) return null;
    
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    // We need to extract the public_id part (everything after the version until the file extension)
    
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // The public_id starts after 'upload/v{version}/'
    // Find the part that starts with 'v' followed by numbers (version)
    const versionIndex = urlParts.findIndex((part, index) => 
        index > uploadIndex && part.startsWith('v') && /^\d+$/.test(part.substring(1))
    );
    
    if (versionIndex === -1) return null;
    
    // Everything after version until the last part (which contains the extension)
    const publicIdParts = urlParts.slice(versionIndex + 1);
    
    // Remove the file extension from the last part
    const lastPart = publicIdParts[publicIdParts.length - 1];
    const extensionIndex = lastPart.lastIndexOf('.');
    if (extensionIndex !== -1) {
        publicIdParts[publicIdParts.length - 1] = lastPart.substring(0, extensionIndex);
    }
    
    return publicIdParts.join('/');
};

const deleteOldImage = async (imageUrl) => {
    try {
        if (!imageUrl) return null;
        
        const publicId = extractPublicIdFromUrl(imageUrl);
        if (!publicId) {
            console.log("Could not extract public_id from URL:", imageUrl);
            return null;
        }
        
        return await deleteFromCloudinary(publicId);
    } catch (error) {
        console.log("Error in deleteOldImage:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary, extractPublicIdFromUrl, deleteOldImage };