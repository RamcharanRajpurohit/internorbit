import { Request, Response } from 'express';
import { Application } from '../../../models/applications';
import { CompanyProfile } from '../../../models/company-profile';
import { Internship } from '../../../models/internships';

interface AuthRequest extends Request {
  user?: any;
}

const getAllCompanyApplications =async (req: AuthRequest, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query
  const company = await CompanyProfile.findOne({ user_id: req.user.id });
  if (!company) {
    return res.status(404).json({ error: 'Comapany profile not found' });
  }

  try {
    const skip = (Number(page) - 1) * Number(limit);

    // Get company's internships
    const internships = await Internship.find({ company_id: company._id });
    const internshipIds = internships.map(i => i._id);

    if (internshipIds.length === 0) {
      return res.json({
        applications: [],
        pagination: { page: 1, limit: 10, total: 0 }
      });
    }

    let query: any = { internship_id: { $in: internshipIds } };

    if (status) {
      query.status = status;
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate({
        path: 'internship_id',
        select: 'id title company_id',
      })
      .populate({
        path: 'student_id',
        select: 'email full_name',
        populate: {
          path: 'student_profiles',
          model: 'StudentProfile',
          select: 'bio university degree skills resume_url',
        },
      })
      .sort({ applied_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      applications,
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


export { getAllCompanyApplications };