import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import Auth from './src/models/Auth';

dotenv.config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      age: 30,
      gender: 'other',
      phone: '1234567890',
      role: 'admin'
    });
    await adminUser.save();

    // Create admin auth
    const adminAuth = new Auth({
      userId: adminUser._id,
      email: 'admin@example.com',
      password: 'admin123' // This will be hashed automatically
    });
    await adminAuth.save();

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('You can now login with these credentials to see the "Add Product" button.');

  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdminUser();