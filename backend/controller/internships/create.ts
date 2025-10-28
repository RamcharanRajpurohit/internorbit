import {  Response } from "express";
import { Internship } from "../../models/internships";
import { CompanyProfile } from "../../models/company-profile";
import { AuthRequest } from "../../middleware/auth";
import { Profile } from "../../models/profile";

const CreateInternships = async (req: AuthRequest, res: Response) => {
  const {
    title,
    description,
    requirements,
    responsibilities,
    location,
    is_remote,
    stipend_min,
    stipend_max,
    duration_months,
    skills_required,
    application_deadline,
    positions_available,
  } = req.body;

  try {
    // Verify user is a company
    const company = await CompanyProfile.findOne({ user_id: req.user.id });
          if (!company) {
            return res.status(404).json({ error: 'Comapany profile not found' });
          }
    console.log("comanay id", company._id);
    const profile = await Profile.findOne({user_id:req.user.id});
    
    if (!profile || profile.role !== 'company') {
      return res.status(403).json({ error: 'Only companies can post internships' });
    }

    const internship = new Internship({
      company_id: company._id,
      title,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      location,
      is_remote: is_remote || false,
      stipend_min,
      stipend_max,
      duration_months,
      skills_required: skills_required || [],
      application_deadline,
      positions_available: positions_available || 1,
      status: 'draft',
    });

    await internship.save();

    res.status(201).json({ internship });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { CreateInternships };
