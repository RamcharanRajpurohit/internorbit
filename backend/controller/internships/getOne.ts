import { Response } from "express";
import { Internship } from "../../models/internships";
import { CompanyProfile } from "../../models/company-profile";
import { StudentProfile } from "../../models/studnet";
import { Application } from "../../models/applications";
import { AuthRequest } from "../../middleware/auth";
// export interface AuthRequest extends Request {
//   params?:any;
// }

const getOneInternship = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const internship = await Internship.findById(id).populate({
      path: "company_id",
      select: "email full_name",
      model: CompanyProfile,
    });

    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }

    // Get company profile
    const companyProfile = await CompanyProfile.findOne({
      user_id: internship.company_id,
    });

    // Check if student has applied to this internship
    let hasApplied = false;
    if (req.user && req.user.id) {
      const studentProfile = await StudentProfile.findOne({ user_id: req.user.id });
      if (studentProfile) {
        const application = await Application.findOne({
          internship_id: internship._id,
          student_id: studentProfile._id,
        });
        hasApplied = !!application;
      }
    }

    // Increment views 
    //to do implement views count base on unique users
    // internship.views_count += 1;
    // await internship.save();

    res.json({
      internship: {
        ...internship.toObject(),
        has_applied: hasApplied,
        company: {
          ...(internship.company_id as any).toObject(),
          company_profiles: companyProfile ? [companyProfile] : [],
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export {getOneInternship} ;
