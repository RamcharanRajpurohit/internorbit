import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { Swipe } from '../models/swipe';
import { SavedInternship } from '../models/saved';
import { StudentProfile } from '../models/studnet';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// ============ SWIPES ============

// Create swipe
router.post('/swipes', verifyToken, async (req: AuthRequest, res: Response) => {
  const { internship_id, direction } = req.body;
  const student = await StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

  if (!['left', 'right'].includes(direction)) {
    return res.status(400).json({ error: 'Invalid swipe direction' });
  }

  try {
    const swipe = new Swipe({
      student_id: req.user.id,
      internship_id,
      direction,
    });

    await swipe.save();

    // If right swipe, also save the job
    if (direction === 'right') {
      const saved = new SavedInternship({
        student_id: student._id,
        internship_id,
      });
      await saved.save().catch(() => {
        // Ignore if already saved
      });
    }

    res.status(201).json({ swipe });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already swiped on this internship' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get student's swipes
router.get('/swipes', verifyToken, async (req: AuthRequest, res: Response) => {
  const { direction, page = 1, limit = 20 } = req.query;
  console.log(req.user.id);
  try {
    const skip = (Number(page) - 1) * Number(limit);
    const student = await StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    let query: any = { student_id:student._id };

    if (direction) {
      query.direction = direction;
    }

    const total = await Swipe.countDocuments(query);
    const swipes = await Swipe.find(query)
      .populate({
        path: 'internship_id',
        select: 'id title location is_remote',
      })
      .sort({ swiped_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      swipes,
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

// Get swipe stats for an internship
router.get('/swipes/stats/:internship_id', async (req: Request, res: Response) => {
  const { internship_id } = req.params;

  try {
    const rightSwipes = await Swipe.countDocuments({
      internship_id,
      direction: 'right',
    });

    const leftSwipes = await Swipe.countDocuments({
      internship_id,
      direction: 'left',
    });

    const total = rightSwipes + leftSwipes;
    const interestRate = total > 0 ? (rightSwipes / total) * 100 : 0;

    res.json({
      stats: {
        right: rightSwipes,
        left: leftSwipes,
        total,
        interestRate: Math.round(interestRate * 10) / 10,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SAVED JOBS ============

// Save internship
router.post('/saved-jobs', verifyToken, async (req: AuthRequest, res: Response) => {
  const { internship_id } = req.body;
  const student = await StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

  try {
    const saved = new SavedInternship({
      student_id: student._id,
      internship_id,
    });

    await saved.save();

    res.status(201).json({ saved });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already saved this internship' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get saved internships
router.get('/saved-jobs', verifyToken, async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);
    const student = await StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const total = await SavedInternship.countDocuments({ student_id:student._id });
    const saved = await SavedInternship.find({ student_id: student._id })
      .populate({
        path: 'internship_id',
        populate: {
          path: 'company_id',
          select: 'email full_name',
          populate: {
            path: 'company_profiles',
            model: 'CompanyProfile',
          },
        },
      })
      .sort({ saved_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      saved,
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

// Check if internship is saved
router.get('/saved-jobs/:internship_id', verifyToken, async (req: AuthRequest, res: Response) => {
  const { internship_id } = req.params;
  const student = await StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

  try {
    const saved = await SavedInternship.findOne({
      student_id: student._id,
      internship_id,
    });

    res.json({ isSaved: !!saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/saved-jobs/:internship_id', verifyToken, async (req: AuthRequest, res: Response) => {
  const { internship_id } = req.params;
  const student = await StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

  try {
    await SavedInternship.findOneAndDelete({
      student_id:student._id,
      internship_id,
    });

    res.json({ message: 'Internship unsaved' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;