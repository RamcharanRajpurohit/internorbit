import { Request, Response } from "express";
import { StudentProfile } from "../../../models/studnet";

interface AuthRequest extends Request {
  user?: any;
  body: any;
  params: any;
}


const GetStudentProfilePublic = async (req: AuthRequest, res: Response) => {
 const { user_id } = req.params;
  
  try {
    const profile = await StudentProfile.findOne({ user_id }).populate({
      path: 'user_id',
      select: 'email full_name avatar_url',
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default GetStudentProfilePublic;