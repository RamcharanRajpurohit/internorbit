import { AuthRequest } from '../../middleware/auth';
import { Response } from 'express';
import { Resume } from '../../models/resume';
import { StudentProfile } from '../../models/studnet';
import { supabase } from '../../config/supabase';
import { getUploadToken } from './get-upload-url';
import { Types } from 'mongoose';

const confirmUpload = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user.id;
    const {
      upload_token,
      file_name,
      file_size,
      mime_type,
      visibility = 'private',
      is_primary = false,
    } = req.body;

    // Verify student
    const student = await StudentProfile.findOne({ user_id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Validate token
    const tokenData = getUploadToken(upload_token);
    if (!tokenData) {
      return res.status(400).json({
        error: 'Invalid or expired upload token',
      });
    }

    // Verify token belongs to this user
    if (tokenData.user_id !== user_id) {
      return res.status(403).json({
        error: 'Token mismatch',
      });
    }

    // Validate file metadata
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimes.includes(mime_type)) {
      // Delete from Supabase
      await supabase.storage
        .from('resumes-private')
        .remove([tokenData.filePath]);

      return res.status(400).json({
        error: 'Invalid file type',
      });
    }

    if (file_size > 10 * 1024 * 1024) {
      // Delete from Supabase
      await supabase.storage
        .from('resumes-private')
        .remove([tokenData.filePath]);

      return res.status(400).json({
        error: 'File too large (max 10 MB)',
      });
    }

    // Validate file name (prevent malicious names)
    const sanitizedFileName = file_name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 255);

    if (!sanitizedFileName) {
      return res.status(400).json({
        error: 'Invalid file name',
      });
    }

    // If setting as primary, unset others
    if (is_primary) {
      await Resume.updateMany(
        { student_id: student._id },
        { is_primary: false }
      );
    }

    // Create Resume document
    const resume = new Resume({
      student_id: student._id,
      user_id,
      file_name: sanitizedFileName,
      file_path: tokenData.filePath,
      file_size,
      mime_type,
      visibility,
      is_primary,
      scan_status: 'clean', // Mark as clean for now (implement real scanning later)
      uploaded_at: new Date(),
    });

    await resume.save();

    res.status(201).json({
      resume: {
        _id: resume._id,
        file_name: resume.file_name,
        visibility: resume.visibility,
        scan_status: resume.scan_status,
        uploaded_at: resume.uploaded_at,
        file_path: resume.file_path,
        file_size: resume.file_size,
        mime_type: resume.mime_type,
      },
      message: 'Resume uploaded successfully!',
    });
  } catch (error: any) {
    console.error('Confirm upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

export { confirmUpload };