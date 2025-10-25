import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { StudentProfile } from '../models/studnet';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Get student profile
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.user.id });

    res.json({ profile: profile || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create student profile
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  const {
    bio,
    university,
    degree,
    graduation_year,
    location,
    skills,
    resume_url,
    phone,
    linkedin_url,
    github_url,
  } = req.body;

  try {
    // Check if already exists
    const existing = await StudentProfile.findOne({ user_id: req.user.id });

    if (existing) {
      return res.status(400).json({ error: 'Student profile already exists' });
    }

    const profile = new StudentProfile({
      user_id: req.user.id,
      bio,
      university,
      degree,
      graduation_year,
      location,
      skills: skills || [],
      resume_url,
      phone,
      linkedin_url: linkedin_url || null,
      github_url: github_url || null,
    });

    await profile.save();

    res.status(201).json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update student profile
router.put('/', verifyToken, async (req: AuthRequest, res: Response) => {
  const updates = req.body;

  try {
    const profile = await StudentProfile.findOneAndUpdate(
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

// Get student profile by ID (public)
router.get('/public/:user_id', async (req: Request, res: Response) => {
  const { user_id } = req.params;

  try {
    const profile = await StudentProfile.findOne({ user_id }).populate({
      path: 'user_id',
      select: 'email full_name avatar_url',
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search students by skills
router.get('/search', async (req: Request, res: Response) => {
  const { skills, university, graduation_year, page = 1, limit = 20 } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};

    if (skills) {
      const skillsArray = (skills as string).split(',');
      query.skills = { $in: skillsArray };
    }

    if (university) {
      query.university = { $regex: university, $options: 'i' };
    }

    if (graduation_year) {
      query.graduation_year = Number(graduation_year);
    }

    const total = await StudentProfile.countDocuments(query);
    const students = await StudentProfile.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      students,
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