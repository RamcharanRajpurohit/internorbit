import { Request, Response } from 'express';
import { Profile } from '../../../models/profile';
import { StudentProfile } from '../../../models/studnet';
import { Resume } from '../../../models/resume';
import { Application } from '../../../models/applications';
import { Internship } from '../../../models/internships';

interface AuthRequest extends Request {
  user?: any;
}

const createApplication = async (req: AuthRequest, res: Response) => {
  const { internship_id, resume_id, cover_letter } = req.body;

  if (!internship_id || !resume_id || !cover_letter) {
    return res.status(400).json({ 
      error: 'internship_id, resume_id, and cover_letter are required' 
    });
  }

  try {
    // Get student profile
    const student = await StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    
    // Check if student profile is complete before allowing application
    if (!student.isProfileComplete()) {
      return res.status(400).json({ 
        error: 'Please complete your profile before applying to internships',
        profile_incomplete: true,
        missing_fields: {
          bio: !student.bio || student.bio.length < 5,
          university: !student.university,
          degree: !student.degree,
          graduation_year: !student.graduation_year,
          location: !student.location,
          skills: !student.skills || student.skills.length === 0,
          phone: !student.phone
        }
      });
    }

    // Verify user is a student
    const profile = await Profile.findOne({ user_id: req.user.id });
    if (profile?.role !== 'student') {
      return res.status(403).json({ error: 'Only students can apply' });
    }

    // Verify resume exists and belongs to student
    const resume = await Resume.findById(resume_id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    if (resume.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Resume does not belong to you' });
    }
    if (resume.scan_status !== 'clean') {
      return res.status(400).json({ 
        error: 'Resume must pass security scan before applying' 
      });
    }

    // Check if already applied
    const existing = await Application.findOne({
      internship_id,
      student_id: student._id,
    });
    if (existing) {
      return res.status(400).json({ error: 'Already applied to this internship' });
    }

    // Verify internship exists
    const internship = await Internship.findById(internship_id);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Create application
    const application = new Application({
      internship_id,
      student_id: student._id,
      resume_id, // NEW: Store resume reference
      cover_letter,
      status: 'pending',
    });

    await application.save();

    // Update internship applications count
    internship.applications_count = (internship.applications_count || 0) + 1;
    await internship.save();

    // Auto-share resume with company (for this application)
    const ResumeShare = require('../../../models/resume-share').ResumeShare;
    await ResumeShare.findOneAndUpdate(
      { resume_id, student_id: student._id, company_id: internship.company_id },
      { 
        resume_id, 
        student_id: student._id, 
        company_id: internship.company_id,
        access_level: 'download',
      },
      { upsert: true }
    );

    // Populate application to EXACTLY MATCH the format from get endpoint
    const populatedApplication = await Application.findById(application._id)
      .populate({
        path: 'internship_id',
        select: 'title description company_id', // ONLY these fields like get endpoint
        populate: {
          path: 'company_id',
          model: 'CompanyProfile',
          select: 'company_name logo_url website industry'
        }
      })
      .populate('student_id', 'full_name email'); // NOT populating resume_id - keep as string like get endpoint

    // Also return standalone internship data for updating internship list
    const internshipData = await Internship.findById(internship_id)
      .populate('company_id', 'company_name logo_url location industry')
      .lean();

    res.status(201).json({ 
      application: populatedApplication, // Application in EXACT same format as get endpoint
      internship: {
        ...internshipData,
        has_applied: true, // Just applied
        applications_count: internship.applications_count,
      },
      message: 'Application submitted successfully'
    });
  } catch (error: any) {
    console.error('Application creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

export { createApplication };