import { Request, Response } from 'express';
import { Swipe } from '../../../../models/swipe';
import { createSwipe } from './create';
import { getSwipeStats } from './get.status';
import { StudentProfile } from '../../../../models/studnet';

interface AuthRequest extends Request {
  user?: any;
}



const getSwipes =async (req: AuthRequest, res: Response) => {
  const { direction, page = 1, limit = 20 } = req.query;
  console.log(req.user.id);
  try {
    const skip = (Number(page) - 1) * Number(limit);
    const student = await StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    let query: any = { student_id: student._id };

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
}


export { createSwipe,getSwipes,getSwipeStats };