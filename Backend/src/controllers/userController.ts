import { Response } from "express";
import User from "../models/User";

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
  }
};