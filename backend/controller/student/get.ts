import { Request, Response } from "express";
import { StudentProfile } from "../../models/studnet";


interface AuthRequest extends Request {
  user?: any;
//   body: any;
}


const GetStudentProfile = async (req: AuthRequest, res: Response) => {
 try {

    const profile = await StudentProfile.aggregate([
      { $match: { user_id: req.user.id } },
      {
        $lookup: {
          from: 'profiles',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'user_info',
        },
      },
      { $unwind: '$user_info' },
      {
        $project: {
          user_id: 1,
          bio: 1,
          // university: 1,
          degree: 1,
          graduation_year: 1,
          location: 1,
          skills: 1,
          resume_url: 1,
          phone: 1,
          linkedin_url: 1,
          github_url: 1,
          profile_completed: 1,
          created_at: 1,
          updated_at: 1,
          user: {
            email: '$user_info.email',
            full_name: '$user_info.full_name',
            avatar_url: '$user_info.avatar_url',
          },
        },
      },
    ]).exec();
    
    const studentProfile = profile[0] || null;
    
    // Calculate and update profile_completed if needed
    if (studentProfile) {
      const studentDoc = await StudentProfile.findOne({ user_id: req.user.id });
      if (studentDoc) {
        const isComplete = studentDoc.isProfileComplete();
        if (studentDoc.profile_completed !== isComplete) {
          studentDoc.profile_completed = isComplete;
          await studentDoc.save();
        }
        studentProfile.profile_completed = isComplete;
      }
    }
    
    res.json({profile: studentProfile});
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default GetStudentProfile;