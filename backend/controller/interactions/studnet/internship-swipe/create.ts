import { Request, Response } from 'express';
import { Swipe } from '../../../../models/swipe';
import { SavedInternship } from '../../../../models/saved';
import { StudentProfile } from '../../../../models/studnet';

interface AuthRequest extends Request {
  user?: any;
}

const createSwipe = async (req: AuthRequest, res: Response) => {
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
      student_id: student._id,
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
}

export { createSwipe };