import { Request, Response } from "express";
import { StudentProfile } from "../../models/studnet";


interface AuthRequest extends Request {
  user?: any;
  body: any;
}


const SearchStudentProfile = async (req: AuthRequest, res: Response) => {
 const { skills, university, graduation_year, page = 1, limit = 20 } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};

    if (skills) {
      const skillsArray = (skills as string).split(',');
      query.skills = { $in: skillsArray };
    }

    if (university) {
      query.university = { $regex: university, $options: 'i' };
    }

    if (graduation_year) {
      query.graduation_year = Number(graduation_year);
    }

    const total = await StudentProfile.countDocuments(query);
    const students = await StudentProfile.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      students,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default SearchStudentProfile;