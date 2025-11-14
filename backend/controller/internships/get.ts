import { Response } from "express";
import { Internship } from "../../models/internships";
import { CompanyProfile } from "../../models/company-profile";
import { StudentProfile } from "../../models/studnet";
import { Application } from "../../models/applications";
import { AuthRequest } from "../../middleware/auth";

const getAllInternships = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search, location, skills, remote } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);
    const query: any = {};

    // Apply filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (remote === "true") {
      query.is_remote = true;
    }

    if (skills) {
      const skillsArray = (skills as string).split(",");
      query.skills_required = { $in: skillsArray };
    }

    const total = await Internship.countDocuments(query);
    const internships = await Internship.find(query)
      .populate({
        path: "company_id",
        select: "email full_name",
        model: CompanyProfile,
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));
    console.log("hers is the intenships for ypu:", internships);

    // Get student profile for has_applied check
    let studentProfile = null;
    if (req.user && req.user.id) {
      console.log("🔍 Looking for student profile with user_id:", req.user.id);
      studentProfile = await StudentProfile.findOne({ user_id: req.user.id });
      console.log("📋 Student profile found:", studentProfile ? studentProfile._id : "NOT FOUND");
    } else {
      console.log("⚠️ No user in request");
    }

    // Populate company profiles and check application status
    const populatedInternships = await Promise.all(
      internships.map(async (internship) => {
        const companyProfile = await CompanyProfile.findOne({
          _id: internship.company_id,
        });
        
        // Check if student has applied to this internship
        let hasApplied = false;
        if (studentProfile) {
          const application = await Application.findOne({
            internship_id: internship._id,
            student_id: studentProfile._id,
          });
          hasApplied = !!application;
          console.log(`✅ Internship ${internship._id}: has_applied = ${hasApplied}, application found:`, application ? application._id : "NO");
        }

        console.log("company profile:", companyProfile);
        return {
          ...internship.toObject(),
          has_applied: hasApplied,
          company: {
            ...(internship.company_id as any).toObject(),
            company_profiles: companyProfile ? [companyProfile] : [],
          },
        };
      })
    );

    res.json({
      internships: populatedInternships,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("Error fetching internships:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllByCompanyId = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    // Find company profile for authenticated user
    const company = await CompanyProfile.findOne({ user_id: req.user.id });
    if (!company) {
      return res.status(404).json({ error: "Company profile not found" });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const query: any = { company_id: company._id };

    const total = await Internship.countDocuments(query);
    const internships = await Internship.find(query)
      .populate({
        path: "company_id",
        // select useful company fields; model can be the CompanyProfile model
        select: "user_id company_name logo_url industry location",
        model: CompanyProfile,
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Ensure a consistent "company" object is attached to each internship
    const populatedInternships = await Promise.all(
      internships.map(async (internship) => {
        const companyProfile = await CompanyProfile.findOne({
          _id: internship.company_id,
        });
        return {
          ...internship.toObject(),
          company: companyProfile ? companyProfile.toObject() : null,
        };
      })
    );

    res.json({
      internships: populatedInternships,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("Error fetching company internships:", error);
    res.status(500).json({ error: error.message });
  }
};

export { getAllInternships, getAllByCompanyId };
