import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAuth extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  password: string;
  lastLogin?: Date;
  isActive: boolean;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const authSchema = new mongoose.Schema<IAuth>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
authSchema.pre("save", async function (next) {
  const user = this as IAuth;

  if (!user.isModified("password")) return next();

  user.password = await bcrypt.hash(user.password, 12);
  next();
});

// Compare passwords
authSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as IAuth;
  return await bcrypt.compare(candidatePassword, user.password);
};

const Auth: Model<IAuth> = mongoose.model<IAuth>("Auth", authSchema);

export default Auth;
