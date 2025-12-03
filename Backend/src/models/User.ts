import mongoose, { Document, Model } from "mongoose";

//Define user structure with role field
export interface IUser extends Document {
  name: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin'; // Role can be 'user' or 'admin'
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  age: {
    type: Number,
    min: [13, 'Must be at least 13 years old'],
    max: [120, 'Age must be realistic']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },

  //Schema with role validation
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user' //default role is user
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;