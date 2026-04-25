import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});  

//  Use upload_large for chunked uploading — prevents timeouts and
// memory exhaustion when users upload large video files. The 6 MB chunk
// size keeps each HTTP request well within Cloudinary's limits.
const CHUNK_SIZE = 6 * 1024 * 1024; // 6 MB per chunk

const uploadOnCloudinary = async (localFilePath, folder) => {
    try {
        if (!localFilePath) return null;

        const fileStat = fs.statSync(localFilePath);
        const isLargeFile = fileStat.size > CHUNK_SIZE;

        let response;

        if (isLargeFile) {
            // Chunked upload for videos / large files
            response = await cloudinary.uploader.upload_large(localFilePath, {
                resource_type: 'auto',
                chunk_size: CHUNK_SIZE,
                ...(folder && { folder }),
            });
        } else {
            // Standard upload for small files (thumbnails, images, etc.)
            response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: 'auto',
                ...(folder && { folder }),
            });
        }

        fs.unlinkSync(localFilePath); // remove temp file after successful upload
        return response;

    } catch (error) {
        // Always clean up the temp file, even on failure
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.log("Error while uploading file on Cloudinary:", error);
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
