import { Request, Response } from 'express';
import { CompanyProfile } from '../../models/company-profile';

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

    await profile.save();

    res.status(201).json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { createCompanyProfile };