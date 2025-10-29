import { Request, Response } from 'express';
import { Swipe } from '../../../../models/swipe';

interface AuthRequest extends Request {
  user?: any;
}


const getSwipeStats = async (req: Request, res: Response) => {
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
}

export { getSwipeStats };