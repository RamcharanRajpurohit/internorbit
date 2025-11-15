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
      // Profile exists - update it instead of throwing error (for onboarding completion)
      existing.bio = bio || existing.bio;
      existing.university = university || existing.university;
      existing.degree = degree || existing.degree;
      existing.graduation_year = graduation_year || existing.graduation_year;
      existing.location = location || existing.location;
      existing.skills = skills || existing.skills;
      existing.resume_url = resume_url || existing.resume_url;
      existing.phone = phone || existing.phone;
      existing.linkedin_url = linkedin_url || existing.linkedin_url;
      existing.github_url = github_url || existing.github_url;
      existing.updated_at = new Date();
      
      // Check if profile is complete and set the flag
      existing.profile_completed = existing.isProfileComplete();
      
      await existing.save();
      
      // Mark onboarding as completed in main profile
      await Profile.findOneAndUpdate(
        { user_id: req.user?.id },
        { onboarding_completed: true }
      );
      
      return res.status(200).json({ profile: existing });
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