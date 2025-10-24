import { Router, Request, Response } from 'express';
import { verifyToken } from './auth';
import { CompanyProfile } from '../models/company-profile';
import { Internship } from '../models/internships';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Get company profile
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await CompanyProfile.findOne({ user_id: req.user.id });

    res.json({ profile: profile || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create company profile
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
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
});

// Update company profile
router.put('/', verifyToken, async (req: AuthRequest, res: Response) => {
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
});

// Get company profile by ID (public)
router.get('/public/:user_id', async (req: Request, res: Response) => {
  const { user_id } = req.params;

  try {
    const profile = await CompanyProfile.findOne({ user_id });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const internships = await Internship.find({
      company_id: user_id,
      status: 'active',
    }).select('id title status applications_count');

    res.json({
      profile: {
        ...profile.toObject(),
        internships,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search companies
router.get('/search', async (req: Request, res: Response) => {
  const { query, industry, location, page = 1, limit = 20 } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);

    let searchQuery: any = {};

    if (query) {
      searchQuery.$or = [
        { company_name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (industry) {
      searchQuery.industry = { $regex: industry, $options: 'i' };
    }

    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    const total = await CompanyProfile.countDocuments(searchQuery);
    const companies = await CompanyProfile.find(searchQuery)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      companies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;