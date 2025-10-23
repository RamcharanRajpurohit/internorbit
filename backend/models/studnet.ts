import mongoose, { Schema, Document, Types } from 'mongoose';

// TypeScript interface for the StudentProfile document
export interface IStudentProfile extends Document {
  user_id: Types.ObjectId;
  bio: string;
  university: string;
  degree: string;
  graduation_year: number;
  location: string;
  skills: string[];
  resume_url: string;
  phone: string;
  linkedin_url?: string;
  github_url?: string;
  created_at: Date;
  updated_at: Date;
}

// Mongoose schema definition
const StudentProfileSchema: Schema = new Schema<IStudentProfile>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
      minlength: [50, 'Bio must be at least 50 characters'],
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    university: {
      type: String,
      required: [true, 'University is required'],
      trim: true,
      index: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      index: true,
    },
    graduation_year: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: [2020, 'Graduation year must be 2020 or later'],
      max: [2035, 'Graduation year cannot exceed 2035'],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true,
    },
    skills: {
      type: [String],
      required: [true, 'Skills are required'],
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one skill must be provided',
      },
      index: true,
    },
    resume_url: {
      type: String,
      required: [true, 'Resume URL is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(v);
        },
        message: 'Please enter a valid phone number',
      },
    },
    linkedin_url: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: function (v: string | null) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(v);
        },
        message: 'Please enter a valid LinkedIn URL',
      },
    },
    github_url: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: function (v: string | null) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?github\.com\/.*$/.test(v);
        },
        message: 'Please enter a valid GitHub URL',
      },
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

// Compound indexes for efficient queries
StudentProfileSchema.index({ university: 1, graduation_year: 1 });
StudentProfileSchema.index({ location: 1, graduation_year: 1 });
StudentProfileSchema.index({ skills: 1, graduation_year: 1 });
StudentProfileSchema.index({ bio: 'text' });

// Pre-save middleware
StudentProfileSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// Instance methods
StudentProfileSchema.methods.hasSkill = function (skill: string): boolean {
  return this.skills.some(
    (s: string) => s.toLowerCase() === skill.toLowerCase()
  );
};

StudentProfileSchema.methods.isRecentGraduate = function (): boolean {
  const currentYear = new Date().getFullYear();
  return this.graduation_year >= currentYear - 2;
};

StudentProfileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Static methods
StudentProfileSchema.statics.findByUniversity = function (university: string) {
  return this.find({ university }).sort({ graduation_year: -1 });
};

StudentProfileSchema.statics.findBySkills = function (skills: string[]) {
  return this.find({
    skills: { $in: skills },
  }).sort({ updated_at: -1 });
};

StudentProfileSchema.statics.findByGraduationYear = function (year: number) {
  return this.find({ graduation_year: year }).sort({ updated_at: -1 });
};

// Export the model
export const StudentProfile = mongoose.model<IStudentProfile>(
  'StudentProfile',
  StudentProfileSchema
);
