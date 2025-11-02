import mongoose, { Schema, Document, Types } from 'mongoose';
export interface IResumeStats extends Document {
  resume_id: Types.ObjectId;
  student_id: Types.ObjectId;
  total_views: number;
  total_downloads: number;
  unique_company_views: number;
  unique_company_downloads: number;
  last_viewed_at?: Date;
  last_downloaded_at?: Date;
  viewers: Array<{
    company_id: Types.ObjectId;
    company_name: string;
    view_count: number;
    download_count: number;
    last_accessed: Date;
  }>;
  updated_at: Date;
}

const ResumeStatsSchema = new Schema<IResumeStats>(
  {
    resume_id: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      unique: true,
      required: true,
    },
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      index: true,
    },
    total_views: {
      type: Number,
      default: 0,
    },
    total_downloads: {
      type: Number,
      default: 0,
    },
    unique_company_views: {
      type: Number,
      default: 0,
    },
    unique_company_downloads: {
      type: Number,
      default: 0,
    },
    last_viewed_at: Date,
    last_downloaded_at: Date,
    viewers: [
      {
        company_id: Schema.Types.ObjectId,
        company_name: String,
        view_count: Number,
        download_count: Number,
        last_accessed: Date,
      },
    ],
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

ResumeStatsSchema.index({ student_id: 1 });

export const ResumeStats = mongoose.model<IResumeStats>(
  'ResumeStats',
  ResumeStatsSchema
);