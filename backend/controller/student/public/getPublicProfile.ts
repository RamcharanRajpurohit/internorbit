import { Request, Response } from "express";
import { StudentProfile } from "../../../models/studnet";
import { Profile } from "../../../models/profile";

interface AuthRequest extends Request {
  user?: any;
}

// Get public student profile - accessible by companies viewing applicants
const getPublicStudentProfile = async (req: AuthRequest, res: Response) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id parameter is required' });
  }

  try {
    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user_id });
    
    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Get user info
    const profile = await Profile.findOne({ user_id });
    
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Return public-safe information (exclude sensitive data)
    const publicProfile = {
      user_id: studentProfile.user_id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      email: profile.email, // Companies need this to contact students
      bio: studentProfile.bio,
      university: studentProfile.university,
      degree: studentProfile.degree,
      graduation_year: studentProfile.graduation_year,
      location: studentProfile.location,
      skills: studentProfile.skills,
      linkedin_url: studentProfile.linkedin_url,
      github_url: studentProfile.github_url,
      phone: studentProfile.phone,
      profile_completed: studentProfile.profile_completed,
      created_at: studentProfile.created_at,
    };

    res.json({ profile: publicProfile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export { getPublicStudentProfile };
