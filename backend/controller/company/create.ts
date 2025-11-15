import { Request, Response } from 'express';
import { CompanyProfile } from '../../models/company-profile';
import { Profile } from '../../models/profile';

interface AuthRequest extends Request {
  user?: any;
}



const createCompanyProfile = async (req: AuthRequest, res: Response) => {
  const {
    company_name,
    description,
    website,
    industry,
    company_size,
    location,
    logo_url,
  } = req.body;

  try {
    // Check if already exists
    const existing = await CompanyProfile.findOne({ user_id: req.user.id });

    if (existing) {
      return res.status(400).json({ error: 'Company profile already exists' });
    }

    const profile = new CompanyProfile({
      user_id: req.user.id,
      company_name,
      description,
      website,
      industry,
      company_size,
      location,
      logo_url: logo_url || null,
    });
    
    // Check if profile is complete and set the flag
    profile.profile_completed = profile.isProfileComplete();

    await profile.save();
    
    // Mark onboarding as completed in main profile
    await Profile.findOneAndUpdate(
      { user_id: req.user.id },
      { onboarding_completed: true }
    );

    res.status(201).json({ profile });
  } catch (error: any) {
    console.error('Company profile creation error:', error);
    
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
}

export { createCompanyProfile };