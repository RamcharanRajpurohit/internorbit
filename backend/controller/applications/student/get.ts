import { Request, Response } from 'express';
import { Application } from '../../../models/applications';
import { StudentProfile } from '../../../models/studnet';

interface AuthRequest extends Request {
  user?: any;
}

const getAllStudentApplications = async (req: AuthRequest, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query;
  const student = await StudentProfile.findOne({ user_id: req.user.id });
  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  try {
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = { student_id: student._id };

    if (status) {
      query.status = status;
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate({
        path: "internship_id",
        select: "title description company_id",
        populate: {
          path: "company_id",
          model: "CompanyProfile", // important
          select: "company_name logo_url website industry",
        },
      })
      .populate("student_id", "full_name email")
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


export { getAllStudentApplications };