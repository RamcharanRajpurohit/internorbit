import { Request, Response } from "express";
import { StudentProfile } from "../../models/studnet";

interface AuthRequest extends Request {
  user?: any;
  body: any;
}


const updateStudentProfile = async (req: AuthRequest, res: Response) => {
  console.log("UPDATE STUDENT");
  
  const updates = req.body;

  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { user_id: req.user.id },
      { ...updates, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Update profile_completed flag based on current data
    profile.profile_completed = profile.isProfileComplete();
    await profile.save();

    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default updateStudentProfile;