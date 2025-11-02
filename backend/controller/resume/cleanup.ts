import { AuthRequest } from '../../middleware/auth';
import { Response } from 'express';
import { ResumeAccessLog } from '../../models/resume-access-log';
import { Profile } from '../../models/profile';



const cleanupOldLogs = async (req: AuthRequest, res: Response) => {
  try {
    // Only admins
    const profile = await Profile.findOne({ user_id: req.user.id });
    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const result = await ResumeAccessLog.deleteMany({
      timestamp: { $lt: ninetyDaysAgo },
    });

    res.json({
      message: `Deleted ${result.deletedCount} logs older than 90 days`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export { cleanupOldLogs };