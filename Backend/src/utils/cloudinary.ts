import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

// Environment variables are loaded via 'dotenv/config' import

// Validate required environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing required Cloudinary environment variables. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (base64Image: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'products',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });
    
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload failed:', error.message);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

export default cloudinary;