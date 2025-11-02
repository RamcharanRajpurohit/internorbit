import { Response } from 'express';
import { supabase } from '../../config/supabase';
import { Resume } from '../../models/resume';
import { StudentProfile } from '../../models/studnet';
import { AuthRequest } from '../../middleware/auth';
import crypto from 'crypto';
import { Types } from 'mongoose';

const getUploadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user.id;
    const authToken = req.headers.authorization?.split(' ')[1];
    
    if (!authToken) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const student = await StudentProfile.findOne({ user_id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Check upload limit (20 per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const uploadCount = await Resume.countDocuments({
      user_id,
      uploaded_at: { $gte: today },
    });

    if (uploadCount >= 20) {
      return res.status(429).json({
        error: 'Daily upload limit reached (20 resumes/day)',
        retry_after: 86400,
      });
    }

    // Generate unique file path WITHOUT .tmp extension
    const fileHash = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const filePath = `resumes/${user_id}/${timestamp}-${fileHash}.pdf`; // Final path

    // Generate upload token (valid for 30 minutes)
    const uploadToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

    // Store upload token
    await storeUploadToken(uploadToken, {
      user_id,
      student_id: (student._id as Types.ObjectId).toString(),
      filePath,
      expiresAt: tokenExpiry,
    });

    // Create a Supabase client with user's auth token
    const userSupabase = createUserSupabaseClient(authToken);

    // Generate signed upload URL - build custom URL with upsert param
    // The SDK might not support options, so we manually construct it
    const { data, error } = await userSupabase.storage
      .from('resumes-private')
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Supabase upload URL error:', error);
      return res.status(500).json({
        error: 'Failed to generate upload URL',
      });
    }

    // Modify the signed URL to include upsert=true parameter
    let uploadUrl = data.signedUrl;
    if (!uploadUrl.includes('upsert=true')) {
      uploadUrl = uploadUrl + (uploadUrl.includes('?') ? '&' : '?') + 'upsert=true';
    }

    res.json({
      upload_url: uploadUrl,
      upload_token: uploadToken,
      file_path: filePath,
      expires_in: 1800,
      max_file_size: 10 * 1024 * 1024,
      allowed_types: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    });
    console.log(`Generated upload URL for user ${user_id}`);
    console.log(`Upload URL: ${uploadUrl}`);
    console.log(`Upload Token: ${uploadToken}`);
  } catch (error: any) {
    console.error('Get upload URL error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Helper: Create Supabase client with user's auth token
 * This allows RLS policies to work correctly
 */
function createUserSupabaseClient(authToken: string) {
  const { createClient } = require('@supabase/supabase-js');
  
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    }
  );
}

/**
 * Helper: Store upload token temporarily
 */
const uploadTokenStore = new Map<string, any>();

async function storeUploadToken(token: string, data: any) {
  uploadTokenStore.set(token, data);
  
  // Auto-cleanup after 31 minutes
  setTimeout(() => {
    uploadTokenStore.delete(token);
  }, 31 * 60 * 1000);
}

function getUploadToken(token: string) {
  return uploadTokenStore.get(token);
}

export { getUploadUrl, getUploadToken };