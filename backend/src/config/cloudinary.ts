import "dotenv/config";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
        folder: 'hisabkitab/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    }),
});

export const fileStorage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => {
        let resourceType = 'auto';
        let folder = 'hisabkitab/others';

        if (file.mimetype.startsWith('image/')) folder = 'hisabkitab/images';
        else if (file.mimetype.startsWith('video/')) folder = 'hisabkitab/videos';
        else if (file.mimetype.startsWith('audio/')) folder = 'hisabkitab/audio';

        return {
            folder,
            resource_type: resourceType,
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
        };
    },
});

// resource_type must match what was used on upload, otherwise destroy silently fails
export const deleteFromCloudinary = async (
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
};

export default cloudinary;