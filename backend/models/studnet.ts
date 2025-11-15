import mongoose, { Schema, Document, Types } from 'mongoose';

// TypeScript interface for the StudentProfile document
export interface IStudentProfile extends Document {
  user_id: string;
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
  profile_completed: boolean;
  created_at: Date;
  updated_at: Date;
  isProfileComplete(): boolean;
}

// Mongoose schema definition
const StudentProfileSchema: Schema = new Schema<IStudentProfile>(
  {
   user_id: {
      type: String,
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    bio: {
      type: String,
      
      trim: true,
      minlength: [5, 'Bio must be at least 5 characters'],
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    university: {
      type: String,
      
      trim: true,
      index: true,
    },
    degree: {
      type: String,
      
      trim: true,
      index: true,
    },
    graduation_year: {
      type: Number,
      index: true,
    },
    location: {
      type: String,
      trim: true,
      index: true,
    },
    skills: {
      type: [String],
      index: true,
    },
    resume_url: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
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
    profile_completed: {
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

StudentProfileSchema.methods.isProfileComplete = function (): boolean {
  // Projects and experience are OPTIONAL - not required for profile completion
  return !!(
    this.bio &&
    this.bio.length >= 5 &&
    this.university &&
    this.degree &&
    this.graduation_year &&
    this.location &&
    this.skills &&
    this.skills.length > 0 &&
    this.phone
  );
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
