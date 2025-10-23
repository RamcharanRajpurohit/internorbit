import mongoose, { Schema, Document } from 'mongoose';

// TypeScript interface for the Profile document
export interface IProfile extends Document {
  email: string;
  full_name: string;
  role: 'student' | 'company' | 'admin';
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

// Mongoose schema definition
const ProfileSchema: Schema = new Schema<IProfile>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address',
      },
    },
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['student', 'company', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'student',
      index: true,
    },
    avatar_url: {
      type: String,
      trim: true,
      default: null,
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

// Indexes for efficient queries
ProfileSchema.index({ role: 1, created_at: -1 });

// Pre-save middleware
ProfileSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// Instance methods
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

// Static methods
ProfileSchema.statics.findByRole = function (role: string) {
  return this.find({ role }).sort({ created_at: -1 });
};

ProfileSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Export the model
export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);
