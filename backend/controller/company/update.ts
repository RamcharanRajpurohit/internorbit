import { Request, Response } from 'express';
import { CompanyProfile } from '../../models/company-profile';

interface AuthRequest extends Request {
  user?: any;
}


const updateCompanyProfile = async (req: AuthRequest, res: Response) => {
  const updates = req.body;

  try {
    const profile = await CompanyProfile.findOneAndUpdate(
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
    console.error('Company profile update error:', error);
    
    // Return detailed validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: messages.join(', ')
      });
    }
    
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
}

export { updateCompanyProfile };