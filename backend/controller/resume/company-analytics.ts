import { Request, Response } from 'express';
import { ResumeAccessLog } from '../../models/resume-access-log';
import { CompanyProfile } from '../../models/company-profile';
import { AuthRequest } from '../../middleware/auth';


const getCompanyAccessAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const company_user_id = req.user.id;
    const { start_date, end_date, resume_id } = req.query;

    // Get company profile
    const company = await CompanyProfile.findOne({ user_id: company_user_id });
    if (!company) {
      return res.status(403).json({ error: 'Company profile required' });
    }

    // Build date filter
    let dateFilter: any = {};
    if (start_date || end_date) {
      dateFilter.timestamp = {};
      if (start_date) dateFilter.timestamp.$gte = new Date(start_date as string);
      if (end_date) dateFilter.timestamp.$lte = new Date(end_date as string);
    }

    // Build query
    const query: any = {
      company_id: company._id,
      ...dateFilter,
    };

    if (resume_id) {
      query.resume_id = resume_id;
    }

    // Get access logs with resume details
    interface PopulatedResume {
      _id: string;
      file_name: string;
      student_id: {
        user_id: {
          full_name: string;
          email: string;
        };
      };
    }

    const logs = await ResumeAccessLog.find(query)
      .populate<{ resume_id: PopulatedResume }>({
        path: 'resume_id',
        select: 'file_name student_id',
        populate: {
          path: 'student_id',
          select: 'user_id',
          populate: {
            path: 'user_id',
            model: 'Profile',
            select: 'full_name email',
          },
        },
      })
      .sort({ timestamp: -1 });

    // Group by resume
    const analytics = new Map();

    logs.forEach((log) => {
      const resumeId = log.resume_id._id.toString();
      if (!analytics.has(resumeId)) {
        analytics.set(resumeId, {
          resume_id: log.resume_id._id,
          file_name: log.resume_id.file_name,
          student_name: log.resume_id.student_id.user_id?.full_name || 'Unknown',
          views: 0,
          downloads: 0,
          first_accessed: log.timestamp,
          last_accessed: log.timestamp,
          access_log: [],
        });
      }

      const data = analytics.get(resumeId);
      if (log.access_type === 'view') {
        data.views += 1;
      } else {
        data.downloads += 1;
      }
      data.last_accessed = log.timestamp;
      data.access_log.push({
        type: log.access_type,
        timestamp: log.timestamp,
        ip: log.ip_address,
      });
    });

    res.json({
      analytics: Array.from(analytics.values()),
      total_logs: logs.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export { getCompanyAccessAnalytics };