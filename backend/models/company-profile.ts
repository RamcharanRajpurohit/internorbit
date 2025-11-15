import mongoose, { Schema, Document, Types } from 'mongoose';

// TypeScript interface for the CompanyProfile document
export interface ICompanyProfile extends Document {
  user_id: string;
  company_name: string;
  description: string;
  website: string;
  industry: string;
  company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  location: string;
  logo_url?: string;
  profile_completed: boolean;
  created_at: Date;
  updated_at: Date;
  isProfileComplete(): boolean;
}

// Mongoose schema definition
const CompanyProfileSchema: Schema = new Schema<ICompanyProfile>(
  {
    user_id: {
      type: String,
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    company_name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [200, 'Company name cannot exceed 200 characters'],
      index: true,
    },
    description: {
      type: String,
      
      trim: true,
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    website: {
      type: String,
     
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
        },
        message: 'Please enter a valid website URL',
      },
    },
    industry: {
      type: String,
      
      trim: true,
      index: true,
    },
    company_size: {
      type: String,
      required: [true, 'Company size is required'],
      enum: {
        values: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
        message: '{VALUE} is not a valid company size',
      },
      index: true,
    },
    location: {
      type: String,
     
      trim: true,
      index: true,
    },
    logo_url: {
      type: String,
      trim: true,
      default: null,
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

// Indexes for efficient queries
CompanyProfileSchema.index({ company_name: 'text', description: 'text' });
CompanyProfileSchema.index({ industry: 1, location: 1 });
CompanyProfileSchema.index({ company_size: 1, industry: 1 });

// Pre-save middleware
CompanyProfileSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// Methods
CompanyProfileSchema.methods.isProfileComplete = function (): boolean {
  return !!(
    this.company_name &&
    this.description &&
    this.description.length >= 50 &&
    this.website &&
    this.industry &&
    this.company_size &&
    this.location
  );
};

CompanyProfileSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Export the model
export const CompanyProfile = mongoose.model<ICompanyProfile>(
  'CompanyProfile',
  CompanyProfileSchema
);
