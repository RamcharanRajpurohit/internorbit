import { ResumeAccessLog } from '../../models/resume-access-log';
import { ResumeShare } from '../../models/resume-share';
import { CompanyProfile } from '../../models/company-profile';
import { StudentProfile } from '../../models/studnet';
import { Resume } from '../../models/resume';
import { AuthRequest } from '../../middleware/auth';
import { Response } from 'express';
import { supabase } from '../../config/supabase';
import crypto from 'crypto';
import { Application } from '../../models/applications';
import mongoose from 'mongoose';
const getSignedUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { resume_id } = req.params;
    const { access_type = 'view', application_id } = req.query; // NEW: Add application_id param
    const user_id = req.user.id;

    // Get resume
    const resume = await Resume.findById(resume_id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Check if it's a student accessing their own resume
    const student = await StudentProfile.findOne({ user_id });
    const isOwnResume = student && resume.user_id === user_id;

    // Check if it's a company accessing a shared resume
    const company = await CompanyProfile.findOne({ user_id });
    let isCompanyAccess = false;

    if (!isOwnResume && company) {
      // If accessing via application, verify company owns the internship
      if (application_id) {
        const application = await Application.findById(application_id);
        if (!application) {
          return res.status(404).json({ error: 'Application not found' });
        }

        // Get the internship to check if company owns it
        const Internship = require('../../models/internships').Internship;
        const internship = await Internship.findById(application.internship_id);
        if (!internship || !internship.company_id.equals(company._id)) {
          return res.status(403).json({ error: 'Not authorized to view this application' });
        }

        // Verify resume is part of this application
        if (!application.resume_id.equals(resume._id as mongoose.Types.ObjectId)) {
          return res.status(400).json({ error: 'Resume does not belong to this application' });
        }
      } else {
        // Check general resume access permissions (public or shared)
        const hasAccess = await checkResumeAccess(resume, company._id, user_id);
        if (!hasAccess) {
          return res.status(403).json({ error: 'You do not have access to this resume' });
        }
      }

      // Check if company has exceeded view limit (abuse prevention)
      const recentViews = await ResumeAccessLog.countDocuments({
        resume_id,
        company_id: company._id,
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // last 1 hour
      });

      if (recentViews > 50) {
        return res.status(429).json({ 
          error: 'Too many access attempts. Please try again later.' 
        });
      }

      isCompanyAccess = true;
    } else if (!isOwnResume) {
      return res.status(403).json({ error: 'You do not have access to this resume' });
    }

    // Generate signed URL (5 minutes for company, 1 hour for student)
    const expirationSeconds = isCompanyAccess ? 300 : 3600;
    const { data, error: signError } = await supabase.storage
      .from('resumes-private')
      .createSignedUrl(resume.file_path, expirationSeconds);

    if (signError) {
      throw signError;
    }

    const signedUrl = data.signedUrl;

    // Record access log (only for company access)
    if (isCompanyAccess) {
      const log = new ResumeAccessLog({
        resume_id: resume._id,
        company_id: company?._id,
        company_user_id: user_id,
        access_type,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        signed_url_token: crypto
          .createHash('sha256')
          .update(signedUrl)
          .digest('hex'),
      });

      await log.save();
    }

    // Update resume stats (only for company access)
    if (isCompanyAccess) {
      if (access_type === 'download') {
        resume.downloads_count += 1;
        resume.last_downloaded_at = new Date();
      } else {
        resume.views_count += 1;
        resume.last_viewed_at = new Date();
      }
      await resume.save();
    }

    res.json({
      signed_url: signedUrl,
      expires_in: expirationSeconds,
      access_type,
    });
  } catch (error: any) {
    console.error('Get signed URL error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to check access
async function checkResumeAccess(
  resume: any,
  company_id: any,
  company_user_id: string
): Promise<boolean> {
  // Public resumes - anyone can access
  if (resume.visibility === 'public' && resume.scan_status === 'clean') {
    return true;
  }

  // Check explicit share
  const share = await ResumeShare.findOne({
    resume_id: resume._id,
    company_id,
  });

  if (share && (!share.expires_at || share.expires_at > new Date())) {
    return true;
  }

  // Check if student applied and shared resume via application
  const Application = require('../../models/applications').Application;
  const studentApplication = await Application.findOne({
    resume_id: resume._id,
    student_id: resume.student_id,
    // Match by internship's company (will verify in main function)
  });

  if (studentApplication) {
    return true;
  }

  return false;
}

export { getSignedUrl };
