import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript interface for the Profile document
export interface IProfile extends Document {
  user_id: string; // 👈 Supabase/Google UUID
  email: string;
  full_name: string;
  role: 'student' | 'company' | 'admin';
  avatar_url?: string;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
  isStudent(): boolean;
  isCompany(): boolean;
  isAdmin(): boolean;
}

// Extend Model to define static methods
interface IProfileModel extends Model<IProfile> {
  findByRole(role: string): Promise<IProfile[]>;
  findByEmail(email: string): Promise<IProfile | null>;
  findByUserId(user_id: string): Promise<IProfile | null>;
}

// Schema definition
const ProfileSchema = new Schema<IProfile>(
  {
    user_id: {
      type: String,
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Please enter a valid email address',
      },
    },
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['student', 'company', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'student',
    },
    avatar_url: {
      type: String,
      trim: true,
      default: null,
    },
    onboarding_completed: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// 🔍 Indexes
ProfileSchema.index({ role: 1, created_at: -1 });

// 🧩 Middleware to update timestamps
ProfileSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// 💪 Instance methods
ProfileSchema.methods.isStudent = function (): boolean {
  return this.role === 'student';
};

ProfileSchema.methods.isCompany = function (): boolean {
  return this.role === 'company';
};

ProfileSchema.methods.isAdmin = function (): boolean {
  return this.role === 'admin';
};

ProfileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// 🧠 Static methods
ProfileSchema.statics.findByRole = function (role: string) {
  return this.find({ role }).sort({ created_at: -1 });
};

ProfileSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

ProfileSchema.statics.findByUserId = function (user_id: string) {
  return this.findOne({ user_id });
};

// 🚀 Export model
export const Profile = mongoose.model<IProfile, IProfileModel>('Profile', ProfileSchema);
