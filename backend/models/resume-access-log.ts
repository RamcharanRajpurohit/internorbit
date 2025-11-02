
import mongoose, { Schema, Document, Types } from 'mongoose';
export interface IResumeAccessLog extends Document {
  resume_id: Types.ObjectId;
  company_id: Types.ObjectId;
  company_user_id: string; // Supabase user ID
  access_type: 'view' | 'download';
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
  signed_url_token?: string; // for audit trail
  access_duration_ms?: number; // how long the URL was used
}

const ResumeAccessLogSchema = new Schema<IResumeAccessLog>(
  {
    resume_id: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'CompanyProfile',
      required: true,
      index: true,
    },
    company_user_id: {
      type: String,
      required: true,
      index: true,
    },
    access_type: {
      type: String,
      enum: ['view', 'download'],
      required: true,
      index: true,
    },
    ip_address: String,
    user_agent: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    signed_url_token: String,
    access_duration_ms: Number,
  },
  { timestamps: false }
);

ResumeAccessLogSchema.index({ resume_id: 1, company_id: 1, timestamp: -1 });
ResumeAccessLogSchema.index({ company_id: 1, timestamp: -1 });
ResumeAccessLogSchema.index({ timestamp: -1 }); // for cleanup/analytics

export const ResumeAccessLog = mongoose.model<IResumeAccessLog>(
  'ResumeAccessLog',
  ResumeAccessLogSchema
);