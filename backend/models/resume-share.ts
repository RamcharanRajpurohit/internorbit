
import mongoose, { Schema, Document, Types } from 'mongoose';
export interface IResumeShare extends Document {
  resume_id: Types.ObjectId;
  student_id: Types.ObjectId;
  company_id: Types.ObjectId;
  shared_by_application_id?: Types.ObjectId; // auto-shared via application
  access_level: 'view' | 'download';
  expires_at?: Date; // optional expiration
  created_at: Date;
}

const ResumeShareSchema = new Schema<IResumeShare>(
  {
    resume_id: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      index: true,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'CompanyProfile',
      required: true,
      index: true,
    },
    shared_by_application_id: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    access_level: {
      type: String,
      enum: ['view', 'download'],
      default: 'download',
    },
    expires_at: Date,
    created_at: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  { timestamps: false }
);

ResumeShareSchema.index({ resume_id: 1, company_id: 1 }, { unique: true });
ResumeShareSchema.index({ student_id: 1, expires_at: 1 });

export const ResumeShare = mongoose.model<IResumeShare>(
  'ResumeShare',
  ResumeShareSchema
);