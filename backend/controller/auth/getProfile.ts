import { Profile } from "../../models/profile";
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";

export const getCurrentUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user.id });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found', exists: false });
    }

    res.json({ profile, exists: true });
  } catch (error: any) {
    console.error('Profile check error:', error);
    res.status(500).json({ error: error.message || 'Failed to check profile' });
  }
};
