import { Profile } from "../../models/profile";
import { StudentProfile } from "../../models/studnet";
import { CompanyProfile } from "../../models/company-profile";
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user.id });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Check profile completion based on role
    let profileCompleted = false;
    
    if (profile.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ user_id: req.user.id });
      if (studentProfile) {
        profileCompleted = studentProfile.isProfileComplete();
        // Update the profile_completed field if it changed
        if (studentProfile.profile_completed !== profileCompleted) {
          studentProfile.profile_completed = profileCompleted;
          await studentProfile.save();
        }
      }
    } else if (profile.role === 'company') {
      const companyProfile = await CompanyProfile.findOne({ user_id: req.user.id });
      if (companyProfile) {
        profileCompleted = companyProfile.isProfileComplete();
        // Update the profile_completed field if it changed
        if (companyProfile.profile_completed !== profileCompleted) {
          companyProfile.profile_completed = profileCompleted;
          await companyProfile.save();
        }
      }
    }

    const response = {
      ...profile.toJSON(),
      profile_completed: profileCompleted,
    };

    res.json({ user: response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
  const { full_name, avatar_url, onboarding_completed } = req.body;

  try {
    // Build update object dynamically
    const updateData: any = { updated_at: new Date() };
    if (full_name !== undefined) updateData.full_name = full_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (onboarding_completed !== undefined) updateData.onboarding_completed = onboarding_completed;

    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user.id }, // 👈 using user_id instead of _id
      updateData,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ user: profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
