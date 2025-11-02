import { ResumeShare } from '../../models/resume-share';
import { CompanyProfile } from '../../models/company-profile';
import { Resume } from '../../models/resume';
import { StudentProfile } from '../../models/studnet';
import { AuthRequest } from '../../middleware/auth';
import { Response } from 'express';

/**
 * Student manually shares resume with a company
 * Creates access grant (view or download)
 */
const shareResume = async (req: AuthRequest, res: Response) => {
  try {
    const { resume_id, company_id } = req.params;
    const { access_level = 'download', expires_in_days = 30 } = req.body;
    const user_id = req.user.id;

    // Get student profile
    const student = await StudentProfile.findOne({ user_id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Verify resume ownership
    const resume = await Resume.findOne({
      _id: resume_id,
      student_id: student._id,
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Verify company exists
    const company = await CompanyProfile.findById(company_id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check existing share
    const existing = await ResumeShare.findOne({
      resume_id,
      company_id,
    });

    if (existing) {
      return res.status(400).json({ error: 'Resume already shared with this company' });
    }

    // Create share
    const expiresAt = expires_in_days
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
      : undefined;

    const share = new ResumeShare({
      resume_id,
      student_id: student._id,
      company_id,
      access_level,
      expires_at: expiresAt,
    });

    await share.save();

    res.status(201).json({
      share,
      message: `Resume shared with ${company.company_name}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Student revokes resume access from a company
 */
const revokeResumeAccess = async (req: AuthRequest, res: Response) => {
  try {
    const { resume_id, company_id } = req.params;
    const user_id = req.user.id;

    const student = await StudentProfile.findOne({ user_id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Verify ownership before deleting
    const share = await ResumeShare.findOne({
      resume_id,
      company_id,
      student_id: student._id,
    });

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    await ResumeShare.deleteOne({ _id: share._id });

    res.json({ message: 'Access revoked' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export { shareResume, revokeResumeAccess };