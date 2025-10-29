import { Request, Response } from 'express';
import { CompanyProfile } from '../../models/company-profile';

interface AuthRequest extends Request {
  user?: any;
}

const getCompanyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await CompanyProfile.findOne({ user_id: req.user.id });

    res.json({ profile: profile || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { getCompanyProfile };