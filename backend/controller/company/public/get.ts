import { Request, Response } from 'express';
import { CompanyProfile } from '../../../models/company-profile';

interface AuthRequest extends Request {
  user?: any;
}


const getCompanyProfilebyId = async (req: AuthRequest, res: Response) => {
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

    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { getCompanyProfilebyId };