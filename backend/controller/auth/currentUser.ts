import { Profile } from "../../models/profile";
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user.id });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ user: profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
  const { full_name, avatar_url } = req.body;

  try {
    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user.id }, // 👈 using user_id instead of _id
      { full_name, avatar_url, updated_at: new Date() },
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
