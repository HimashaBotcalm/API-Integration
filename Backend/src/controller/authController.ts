import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Auth from '../models/Auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, age, gender, phone, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    
    const existingAuth = await Auth.findOne({ email: email.toLowerCase() });
    if (existingAuth) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    
    const user = new User({ name, email, age, gender, phone, role: role || 'user' });
    await user.save();
    
    const auth = new Auth({ userId: user._id, email, password });
    await auth.save();
    
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.status(201).json({ 
      message: "User created successfully",
      user: { id: user._id, name: user.name, email: user.email, age: user.age, gender: user.gender, phone: user.phone, role: user.role } 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    const auth = await Auth.findOne({ email: email.toLowerCase() });
    if (!auth || !auth.isActive) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const isPasswordValid = await auth.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const user = await User.findById(auth.userId);
    auth.lastLogin = new Date();
    await auth.save();
    
    const token = jwt.sign({ userId: user!._id, email: user!.email, role: user!.role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.json({ 
      message: "Login successful", 
      user: { id: user!._id, name: user!.name, email: user!.email, age: user!.age, gender: user!.gender, phone: user!.phone, role: user!.role, lastLogin: auth.lastLogin } 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: "Logged out successfully" });
};

export const verify = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      res.clearCookie('token');
      return res.status(401).json({ error: "User not found. Please login again." });
    }
    
    res.json({
      user: { id: user._id, name: user.name, email: user.email, age: user.age, gender: user.gender, phone: user.phone, role: user.role }
    });
  } catch (error: any) {
    res.clearCookie('token');
    res.status(500).json({ error: error.message });
  }
};