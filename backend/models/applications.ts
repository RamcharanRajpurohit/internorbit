
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  internship_id: Types.ObjectId;
  student_id: Types.ObjectId;
  resume_id: Types.ObjectId; // NEW: Link to Resume model
  cover_letter: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  applied_at: Date;
  updated_at: Date;
  reviewed_at?: Date;
  feedback?: string;
}

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
    resume_id: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: [true, 'Resume ID is required'],
    },
    cover_letter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
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
    reviewed_at: Date,
    feedback: String,
  },
  {
    timestamps: {
      createdAt: 'applied_at',
      updatedAt: 'updated_at',
    },
  }
);

ApplicationSchema.index({ internship_id: 1, student_id: 1 }, { unique: true });
ApplicationSchema.index({ student_id: 1, status: 1 });
ApplicationSchema.index({ internship_id: 1, status: 1 });
ApplicationSchema.index({ resume_id: 1 }); // NEW: For finding applications by resume

ApplicationSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

export const Application = mongoose.model<IApplication>(
  'Application',
  ApplicationSchema
);