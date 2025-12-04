import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import 'dotenv/config';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME || !process.env.AWS_REGION) {
  throw new Error('Missing required AWS environment variables. Please check AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, and AWS_REGION in your .env file.');
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (base64Image: string, userId: string): Promise<string> => {
  try {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const key = `profile-pics/${userId}-${Date.now()}.jpg`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg'
    });

    await s3Client.send(command);
    
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error: any) {
    console.error('S3 upload failed:', error.message);
    throw new Error(`Profile picture upload failed: ${error.message}`);
  }
};