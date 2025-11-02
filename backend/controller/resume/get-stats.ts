import { Resume } from '../../models/resume';
import { ResumeAccessLog } from '../../models/resume-access-log';
import { AuthRequest } from '../../middleware/auth';
import { Response } from 'express';









const getResumeStats = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user.id;

    // Get all student resumes
    const resumes = await Resume.find({ user_id })
      .sort({ uploaded_at: -1 });

    if (!resumes.length) {
      return res.json({
        resumes: [],
        total_views: 0,
        total_downloads: 0,
        companies: [],
      });
    }

    const resume_ids = resumes.map((r) => r._id);

    // Get access logs
    const logs = await ResumeAccessLog.find({
      resume_id: { $in: resume_ids },
    }).populate('company_id', 'company_name logo_url');

    // Aggregate stats per resume
    const resumeStats = resumes.map((resume: any) => {
      const resumeLogs = logs.filter(
        (l) => l.resume_id.toString() === resume._id.toString()
      );

      const views = resumeLogs.filter((l) => l.access_type === 'view').length;
      const downloads = resumeLogs.filter(
        (l) => l.access_type === 'download'
      ).length;

      return {
        _id: resume._id,
        file_name: resume.file_name,
        visibility: resume.visibility,
        views,
        downloads,
        uploaded_at: resume.uploaded_at,
        last_viewed: resume.last_viewed_at,
      };
    });

    // Aggregate company interactions
    const companyStats = new Map();
    logs.forEach((log) => {
      const companyId = log.company_id._id.toString();
      if (!companyStats.has(companyId)) {
        companyStats.set(companyId, {
          company_id: log.company_id._id,
        //   company_name: log.company_id.company_name,
          views: 0,
          downloads: 0,
          last_accessed: log.timestamp,
        });
      }

      const stats = companyStats.get(companyId);
      if (log.access_type === 'view') {
        stats.views += 1;
      } else {
        stats.downloads += 1;
      }
      stats.last_accessed = log.timestamp;
    });

    res.json({
      resumes: resumeStats,
      total_views: logs.filter((l) => l.access_type === 'view').length,
      total_downloads: logs.filter((l) => l.access_type === 'download').length,
      companies: Array.from(companyStats.values()),
    });
  } catch (error: any) {
    console.error('Get resume stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

export { getResumeStats };