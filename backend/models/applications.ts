import mongoose, { Schema, Document, Types } from 'mongoose';

// TypeScript interface for the Application document
export interface IApplication extends Document {
  internship_id: Types.ObjectId;
  student_id: Types.ObjectId;
  cover_letter: string;
  resume_url: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  applied_at: Date;
  updated_at: Date;
}

// Mongoose schema definition
const ApplicationSchema: Schema = new Schema<IApplication>(
  {
    internship_id: {
      type: Schema.Types.ObjectId,
      ref: 'Internship',
      required: [true, 'Internship ID is required'],
      index: true,
    },
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student ID is required'],
      index: true,
    },
    cover_letter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
    },
    resume_url: {
      type: String,
      required: [true, 'Resume URL is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'withdrawn'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      index: true,
    },
    applied_at: {
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
      createdAt: 'applied_at',
      updatedAt: 'updated_at',
    },
  }
);

// Compound index for efficient queries
ApplicationSchema.index({ internship_id: 1, student_id: 1 }, { unique: true });
ApplicationSchema.index({ student_id: 1, status: 1 });
ApplicationSchema.index({ internship_id: 1, status: 1 });

// Pre-save middleware to update the updated_at timestamp
ApplicationSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// Export the model
export const Application = mongoose.model<IApplication>(
  'Application',
  ApplicationSchema
);
