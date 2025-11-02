import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IResume extends Document {
  student_id: Types.ObjectId;
  user_id: string; // Supabase user ID
  file_name: string;
  file_path: string; // Supabase storage path
  file_size: number; // in bytes
  mime_type: string;
  visibility: 'private' | 'public' | 'restricted';
  is_primary: boolean;
  scan_status: 'pending' | 'clean' | 'rejected';
  scan_message?: string; // error/warning details
  malware_check_date?: Date;
  uploaded_at: Date;
  updated_at: Date;
  views_count: number;
  downloads_count: number;
  last_viewed_at?: Date;
  last_downloaded_at?: Date;
  restricted_access_ids: Types.ObjectId[]; // company IDs with explicit access
}

const ResumeSchema = new Schema<IResume>(
  {
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    file_name: {
      type: String,
      required: true,
      trim: true,
    },
    file_path: {
      type: String,
      required: true,
      unique: true,
    },
    file_size: {
      type: Number,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ['private', 'public', 'restricted'],
      default: 'private',
      index: true,
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
    scan_status: {
      type: String,
      enum: ['pending', 'clean', 'rejected'],
      default: 'pending',
      index: true,
    },
    scan_message: String,
    malware_check_date: Date,
    uploaded_at: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    views_count: {
      type: Number,
      default: 0,
    },
    downloads_count: {
      type: Number,
      default: 0,
    },
    last_viewed_at: Date,
    last_downloaded_at: Date,
    restricted_access_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CompanyProfile',
      },
    ],
  },
  { timestamps: { createdAt: 'uploaded_at', updatedAt: 'updated_at' } }
);

ResumeSchema.index({ student_id: 1, visibility: 1 });
ResumeSchema.index({ user_id: 1, scan_status: 1 });
ResumeSchema.index({ visibility: 1, scan_status: 1 });

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);