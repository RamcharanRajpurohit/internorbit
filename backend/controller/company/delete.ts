import { Request, Response } from 'express';
import { CompanyProfile } from '../../models/company-profile';

interface AuthRequest extends Request {
  user?: any;
}

const deleteCompanyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await CompanyProfile.findOneAndDelete({ user_id: userId });
    res.json({ message: 'Company profile deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { deleteCompanyProfile };