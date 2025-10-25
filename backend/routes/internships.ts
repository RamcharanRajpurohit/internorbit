// backend/routes/internships.ts
import { Router, Response } from 'express';
import { Internship } from '../models/internships';
import { Profile } from '../models/profile';
import { CompanyProfile } from '../models/company-profile';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all active internships with pagination and filters
router.get('/', async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search, location, skills, remote } = req.query;
  
  try {
    const skip = (Number(page) - 1) * Number(limit);
    const query: any = { status: 'active' };

    // Apply filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (remote === 'true') {
      query.is_remote = true;
    }

    if (skills) {
      const skillsArray = (skills as string).split(',');
      query.skills_required = { $in: skillsArray };
    }

    const total = await Internship.countDocuments(query);
    const internships = await Internship.find(query)
      .populate({
        path: 'company_id',
        select: 'email full_name',
        model: Profile
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Populate company profiles
    const populatedInternships = await Promise.all(
      internships.map(async (internship) => {
        const companyProfile = await CompanyProfile.findOne({ 
          user_id: internship.company_id 
        });
        
        return {
          ...internship.toObject(),
          company: {
            ...(internship.company_id as any).toObject(),
            company_profiles: companyProfile ? [companyProfile] : []
          }
        };
      })
    );

    res.json({
      internships: populatedInternships,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single internship
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const internship = await Internship.findById(id)
      .populate({
        path: 'company_id',
        select: 'email full_name',
        model: Profile
      });

    if (!internship || internship.status !== 'active') {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Get company profile
    const companyProfile = await CompanyProfile.findOne({ 
      user_id: internship.company_id 
    });

    // Increment views
    internship.views_count += 1;
    await internship.save();

    res.json({
      internship: {
        ...internship.toObject(),
        company: {
          ...(internship.company_id as any).toObject(),
          company_profiles: companyProfile ? [companyProfile] : []
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create internship (Company only)
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  const {
    title,
    description,
    requirements,
    responsibilities,
    location,
    is_remote,
    stipend_min,
    stipend_max,
    duration_months,
    skills_required,
    application_deadline,
    positions_available,
  } = req.body;

  try {
    // Verify user is a company
    const company = await CompanyProfile.findOne({ user_id: req.user.id });
          if (!company) {
            return res.status(404).json({ error: 'Comapany profile not found' });
          }
    const profile = await Profile.findOne({user_id:req.user.id});
    
    if (!profile || profile.role !== 'company') {
      return res.status(403).json({ error: 'Only companies can post internships' });
    }

    const internship = new Internship({
      company_id: company._id,
      title,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      location,
      is_remote: is_remote || false,
      stipend_min,
      stipend_max,
      duration_months,
      skills_required: skills_required || [],
      application_deadline,
      positions_available: positions_available || 1,
      status: 'draft',
    });

    await internship.save();

    res.status(201).json({ internship });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update internship (Company only)
router.put('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  const company = await CompanyProfile.findOne({ user_id: req.user.id });
        if (!company) {
          return res.status(404).json({ error: 'Comapany profile not found' });
        }
  const { id } = req.params;
  const updates = req.body;

  try {
    const internship = await Internship.findById(id);

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    if (internship.company_id.toString() !== company._id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(internship, updates);
    internship.updated_at = new Date();
    await internship.save();

    res.json({ internship });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Publish internship
router.patch('/:id/publish', verifyToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const company = await CompanyProfile.findOne({ user_id: req.user.id });
        if (!company) {
          return res.status(404).json({ error: 'Comapany profile not found' });
        }
 
  try {
    const internship = await Internship.findById(id);

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    if (internship.company_id.toString() !== company._id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    internship.status = 'active';
    internship.updated_at = new Date();
    await internship.save();

    res.json({ internship });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete internship
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const company = await CompanyProfile.findOne({ user_id: req.user.id });
        if (!company) {
          return res.status(404).json({ error: 'Comapany profile not found' });
        }

  try {
    const internship = await Internship.findById(id);

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    if (internship.company_id.toString() !== company._id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await internship.deleteOne();

    res.json({ message: 'Internship deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;