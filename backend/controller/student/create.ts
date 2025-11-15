import { Request, Response } from "express";
import { StudentProfile } from "../../models/studnet";
import { Profile } from "../../models/profile";


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
    
    // Check if profile is complete and set the flag
    profile.profile_completed = profile.isProfileComplete();

    await profile.save();
    
    // Mark onboarding as completed in main profile
    await Profile.findOneAndUpdate(
      { user_id: req.user?.id },
      { onboarding_completed: true }
    );

    res.status(201).json({ profile });
  } catch (error: any) {
    console.error('Student profile creation error:', error);
    
    // Return detailed validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: messages.join(', ')
      });
    }
    
    res.status(500).json({ error: error.message || 'Failed to create profile' });
  }
};

export default CreateStudentProfile;