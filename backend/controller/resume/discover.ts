import { Request, Response } from 'express';

import { Resume } from '../../models/resume';


import { AuthRequest } from '../../middleware/auth';

import { CompanyProfile } from '../../models/company-profile';

const discoverResumes = async (req: AuthRequest, res: Response) => {
  try {
    const company_id = req.user.id;
    const { page = 1, limit = 20, skills, university } = req.query;

    // Verify company profile exists
    const company = await CompanyProfile.findOne({ user_id: company_id });
    if (!company) {
      return res.status(403).json({ error: 'Only companies can discover resumes' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Build query for public resumes only (clean scans)
    let query: any = {
      visibility: 'public',
      scan_status: 'clean',
    };

    if (skills) {
      query['student_profile.skills'] = {
        $in: (skills as string).split(','),
      };
    }

    if (university) {
      query['student_profile.university'] = {
        $regex: university,
        $options: 'i',
      };
    }

    // Use aggregation to join with StudentProfile
    const resumes = await Resume.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'studentprofiles',
          localField: 'student_id',
          foreignField: '_id',
          as: 'student_profile',
        },
      },
      { $unwind: '$student_profile' },
      {
        $project: {
          _id: 1,
          file_name: 1,
          uploaded_at: 1,
          views_count: 1,
          downloads_count: 1,
          'student_profile.university': 1,
          'student_profile.degree': 1,
          'student_profile.skills': 1,
          'student_profile.graduation_year': 1,
        },
      },
      { $sort: { uploaded_at: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    const total = await Resume.countDocuments(query);

    res.json({
      resumes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error: any) {
    console.error('Discover resumes error:', error);
    res.status(500).json({ error: error.message });
  }
};

export { discoverResumes };