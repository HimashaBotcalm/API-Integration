import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import User from "./src/models/User";
import Auth from "./src/models/Auth";
import Product from "./src/models/Product";

dotenv.config();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
  cookies: { [key: string]: string };
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

//Token verification with role
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    req.user = decoded;
    next(); //Passes control to the route handler
  } catch (error) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};

//Admin-only access control
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('requireAdmin - User:', req.user);
  if (req.user?.role !== 'admin') {
    console.log('requireAdmin - Access denied. User role:', req.user?.role);
    return res.status(403).json({ error: 'Admin access required' });
  }
  console.log('requireAdmin - Admin access granted');
  next();
};

// Force close any existing connections
if (mongoose.connection.readyState !== 0) {
  await mongoose.disconnect();
}

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);
    console.log(`🆔 Connection String: ${process.env.MONGO_URI}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("💡 Make sure MongoDB is running on your system");
    console.log("💡 Check your MONGO_URI in .env file");
    process.exit(1);
  });

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Backend API is running",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", async (req: Request, res: Response) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states: { [key: number]: string } = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (dbState === 1) {
      await User.countDocuments();
      res.json({
        status: "healthy",
        database: states[dbState],
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: "unhealthy",
        database: states[dbState],
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

//Backend pagination and user management routes
//All authenticated users can view users
app.get("/users", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find({ isActive: true })
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments({ isActive: true });
    
    res.json({
      debug: {
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        connectionString: process.env.MONGO_URI
      },
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
});

app.post("/users", async (req: Request, res: Response) => {
  try {
    console.log('POST /users - Request body:', req.body);
    const user = new User(req.body);
    await user.save();
    console.log('User saved successfully:', user._id);
    res.status(201).json(user);
  } catch (error: any) {
    console.log('POST /users - Error:', error.message);
    console.log('POST /users - Error details:', error);
    res.status(400).json({ 
      error: error.message,
      details: error.errors || error
    });
  }
});

//User, admin update
app.put("/users/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});


//User, admin delete
app.delete("/users/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/auth/signup", async (req: Request, res: Response) => {
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
    
    //JWT includes role information
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.status(201).json({ 
      message: "User created successfully",
      debug: {
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        connectionString: process.env.MONGO_URI
      },
      user: {
        id: user._id,
        name: user.name, 
        email: user.email,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        role: user.role
      } 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


//JWT login route- Token generation
app.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body; //Password validation
    
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
    
    //Generate JWT token
    const token = jwt.sign(
      { 
        userId: user!._id, 
        email: user!.email,
        role: user!.role
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    //Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.json({ 
      message: "Login successful", 
      user: {
        id: user!._id,
        name: user!.name, 
        email: user!.email,
        age: user!.age,
        gender: user!.gender,
        phone: user!.phone,
        role: user!.role,
        lastLogin: auth.lastLogin
      } 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

//Logout route - Clear cookie
app.post("/auth/logout", (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: "Logged out successfully" });
});

//Clear all cookies (for testing purposes)
app.post("/auth/clear", (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: "All cookies cleared" });
});

//Auth status check for monitoring
app.get("/auth/status", (req: Request, res: Response) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }
  
  try {
    jwt.verify(token, JWT_SECRET);  //Token verification
    res.json({ authenticated: true });
  } catch (error) {
    res.status(401).json({ authenticated: false });
  }
});

// Profile routes
app.get("/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
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
});

app.put("/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, age, gender, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { name, age, gender, phone, avatar },
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
});

app.get("/debug/db", async (req: Request, res: Response) => {
  try {
    const userCount = await User.countDocuments();
    const authCount = await Auth.countDocuments();
    const users = await User.find().limit(5);
    res.json({
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      connectionString: process.env.MONGO_URI,
      userCount,
      authCount,
      sampleUsers: users
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/auth/verify", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      res.clearCookie('token');
      return res.status(401).json({ error: "User not found. Please login again." });
    }
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error: any) {
    res.clearCookie('token');
    res.status(500).json({ error: error.message });
  }
});

// Product routes
app.get("/products", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const products = await Product.find({ isActive: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments({ isActive: true });
    
    res.json({
      products,
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
});

app.post("/products", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('POST /products - Request body:', req.body);
    console.log('POST /products - User:', req.user);
    
    const { uploadToCloudinary } = await import('./src/utils/cloudinary');
    const productData = { ...req.body };
    
    // Validate required fields
    if (!productData.name || productData.name.trim().length < 2) {
      return res.status(400).json({ error: 'Product name is required and must be at least 2 characters' });
    }
    
    if (productData.price === undefined || productData.price === null || isNaN(Number(productData.price)) || Number(productData.price) < 0) {
      return res.status(400).json({ error: 'Valid price is required and must be positive' });
    }
    
    if (productData.stock === undefined || productData.stock === null || isNaN(Number(productData.stock)) || Number(productData.stock) < 0) {
      return res.status(400).json({ error: 'Valid stock is required and must be positive' });
    }
    
    // Convert price and stock to numbers
    productData.price = Number(productData.price);
    productData.stock = Number(productData.stock);
    
    // Handle image upload
    if (productData.image && productData.image.startsWith('data:image')) {
      try {
        productData.image = await uploadToCloudinary(productData.image);
      } catch (imageError: any) {
        console.error('Image upload error:', imageError);
        return res.status(400).json({ error: 'Failed to upload image: ' + imageError.message });
      }
    }
    
    console.log('POST /products - Final product data:', productData);
    
    const product = new Product(productData);
    await product.save();
    
    console.log('POST /products - Product saved successfully:', product._id);
    res.status(201).json(product);
  } catch (error: any) {
    console.error('POST /products - Error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors,
        fields: error.errors 
      });
    }
    
    res.status(400).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

app.put("/products/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('PUT /products/:id - Request body:', req.body);
    console.log('PUT /products/:id - User:', req.user);
    
    const { uploadToCloudinary } = await import('./src/utils/cloudinary');
    const productData = { ...req.body };
    
    // Convert price and stock to numbers if provided
    if (productData.price !== undefined) {
      productData.price = Number(productData.price);
    }
    if (productData.stock !== undefined) {
      productData.stock = Number(productData.stock);
    }
    
    // Handle image upload
    if (productData.image && productData.image.startsWith('data:image')) {
      try {
        productData.image = await uploadToCloudinary(productData.image);
      } catch (imageError: any) {
        console.error('Image upload error:', imageError);
        return res.status(400).json({ error: 'Failed to upload image: ' + imageError.message });
      }
    }
    
    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    console.log('PUT /products/:id - Product updated successfully:', product._id);
    res.json(product);
  } catch (error: any) {
    console.error('PUT /products/:id - Error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors,
        fields: error.errors 
      });
    }
    
    res.status(400).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

app.delete("/products/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});