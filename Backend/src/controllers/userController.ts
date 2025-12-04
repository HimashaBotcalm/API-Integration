import { Response } from "express";
import User from "../models/User";
import { uploadToS3 } from "../utils/s3";

interface AuthRequest {
  user?: { userId: string; email: string; role: string };
  query: any;
  body: any;
  params: any;
}

export const userController = {
  getUsers: async (req: AuthRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const users = await User.find({ isActive: true })
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await User.countDocuments({ isActive: true });
      
      res.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  createUser: async (req: AuthRequest, res: Response) => {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ 
        error: error.message,
        details: error.errors || error
      });
    }
  },

  updateUser: async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteUser: async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      const { name, age, gender, phone, avatar } = req.body;
      const updateData: any = { name, age, gender, phone };
      
      if (avatar && avatar.startsWith('data:image')) {
        try {
          updateData.avatar = await uploadToS3(avatar, req.user!.userId);
        } catch (uploadError: any) {
          return res.status(400).json({ error: 'Failed to upload profile picture: ' + uploadError.message });
        }
      } else if (avatar) {
        updateData.avatar = avatar;
      }
      
      const user = await User.findByIdAndUpdate(
        req.user!.userId,
        updateData,
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  uploadProfilePicture: async (req: AuthRequest, res: Response) => {
    try {
      console.log('Upload request received:', { userId: req.user?.userId });
      const { image } = req.body;
      
      if (!image || !image.startsWith('data:image')) {
        console.log('Invalid image format:', image ? 'Invalid format' : 'No image');
        return res.status(400).json({ error: 'Valid base64 image is required' });
      }
      
      console.log('Uploading to S3...');
      const avatarUrl = await uploadToS3(image, req.user!.userId);
      console.log('S3 upload successful, URL:', avatarUrl);
      
      console.log('Updating user in database...');
      const user = await User.findByIdAndUpdate(
        req.user!.userId,
        { avatar: avatarUrl },
        { new: true }
      );
      
      if (!user) {
        console.log('User not found in database');
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log('Database updated successfully. User avatar:', user.avatar);
      res.json({ 
        success: true,
        avatar: user.avatar,
        message: 'Profile picture updated successfully'
      });
    } catch (error: any) {
      console.error('Upload error details:', error);
      res.status(400).json({ error: error.message });
    }
  },

  debugUsers: async (req: AuthRequest, res: Response) => {
    try {
      const allUsers = await User.find({});
      const userCount = await User.countDocuments({});
      console.log('Total users in collection:', userCount);
      console.log('Collection name:', User.collection.name);
      res.json({
        collectionName: User.collection.name,
        totalUsers: userCount,
        users: allUsers
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};