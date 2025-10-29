import { Request, Response } from 'express';
import { Profile } from '../../../models/profile';
import { StudentProfile } from '../../../models/studnet';
import { Application } from '../../../models/applications';
import { Internship } from '../../../models/internships';

interface AuthRequest extends Request {
  user?: any;
}

const createApplication = async (req: AuthRequest, res: Response) => {
  const { internship_id, cover_letter, resume_url } = req.body;


  const student = await StudentProfile.findOne({ user_id: req.user.id });
  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  try {
    // Verify user is a student
    const profile = await Profile.findOne({ user_id: req.user.id });

    if (profile?.role !== 'student') {
      return res.status(403).json({ error: 'Only students can apply' });
    }

    // Check if already applied
    const existing = await Application.findOne({
      internship_id,
      student_id: student._id,
    });

    if (existing) {
      return res.status(400).json({ error: 'Already applied to this internship' });
    }

    // Create application
    const application = new Application({
      internship_id,
      student_id: student._id,
      cover_letter,
      resume_url,
      status: 'pending',
    });

    await application.save();

    // Update internship applications count
    const internship = await Internship.findById(internship_id);
    if (internship) {
      internship.applications_count = (internship.applications_count || 0) + 1;
      await internship.save();
    }

    res.status(201).json({ application });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { createApplication };