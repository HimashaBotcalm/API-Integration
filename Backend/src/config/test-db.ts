import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function testDatabase(): Promise<void> {
  try {
    console.log("🔄 Testing MongoDB connection...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB successfully!");
    
    // Test User model
    console.log("🔄 Testing User model...");
    const userCount: number = await User.countDocuments();
    console.log(`📊 Current users in database: ${userCount}`);
    
    // Test creating a sample user (will be removed)
    console.log("🔄 Testing user creation...");
    const testUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: "testpass123"
    });
    
    // Save the test user
    const savedUser = await testUser.save();
    console.log("✅ User created and saved!", savedUser._id);
    
    console.log("🎉 All database tests passed!");
    
  } catch (error: any) {
    console.error("❌ Database test failed:", error.message);
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", Object.values(error.errors).map((e: any) => e.message));
    }
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

testDatabase();