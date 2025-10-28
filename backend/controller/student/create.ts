import { Request, Response } from "express";
import { StudentProfile } from "../../models/studnet";


interface AuthRequest extends Request {
  user?: any;
  body: any;
}


const CreateStudentProfile = async (req: AuthRequest, res: Response) => {
  const {
    bio,
    university,
    degree,
    graduation_year,
    location,
    skills,
    resume_url,
    phone,
    linkedin_url,
    github_url,
  } = req.body || {};

  try {
    // Check if already exists
    const existing = await StudentProfile.findOne({ user_id: req.user?.id });

    if (existing) {
      return res.status(400).json({ error: 'Student profile already exists' });
    }

    const profile = new StudentProfile({
      user_id: req.user?.id,
      bio,
      university,
      degree,
      graduation_year,
      location,
      skills: skills || [],
      resume_url,
      phone,
      linkedin_url: linkedin_url || null,
      github_url: github_url || null,
    });

    await profile.save();

    res.status(201).json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default CreateStudentProfile;