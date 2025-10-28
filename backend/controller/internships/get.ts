import { Response } from "express";
import { Internship } from "../../models/internships";
import { CompanyProfile } from "../../models/company-profile";
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

    // Populate company profiles
    const populatedInternships = await Promise.all(
      internships.map(async (internship) => {
        const companyProfile = await CompanyProfile.findOne({
          _id: internship.company_id,
        });
        console.log("company profile:", companyProfile);
        return {
          ...internship.toObject(),
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

export { getAllInternships };
