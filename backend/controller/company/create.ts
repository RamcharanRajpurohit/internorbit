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
      // Profile exists - update it instead of throwing error (for onboarding completion)
      existing.company_name = company_name || existing.company_name;
      existing.description = description || existing.description;
      existing.website = website || existing.website;
      existing.industry = industry || existing.industry;
      existing.company_size = company_size || existing.company_size;
      existing.location = location || existing.location;
      existing.logo_url = logo_url || existing.logo_url;
      existing.updated_at = new Date();
      
      // Check if profile is complete and set the flag
      existing.profile_completed = existing.isProfileComplete();
      
      await existing.save();
      
      // Mark onboarding as completed in main profile
      await Profile.findOneAndUpdate(
        { user_id: req.user.id },
        { onboarding_completed: true }
      );
      
      return res.status(200).json({ profile: existing });
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