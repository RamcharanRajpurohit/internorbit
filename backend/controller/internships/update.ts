import { Response } from "express";
import { Internship } from "../../models/internships";
import { CompanyProfile } from "../../models/company-profile";
import { AuthRequest } from "../../middleware/auth";
// export interface AuthRequest extends Request {
//   params: any;
//   user: any;
//   body?: any;
// }

const UpdateInternshipsDetails = async (req: AuthRequest, res: Response) => {
  const company = await CompanyProfile.findOne({ user_id: req.user.id });
  if (!company) {
    return res.status(404).json({ error: "Comapany profile not found" });
  }
  const { id } = req.params;
  const updates = req.body;

  try {
    const internship = await Internship.findById(id);

    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }

    if (internship.company_id.toString() !== company._id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    Object.assign(internship, updates);
    internship.updated_at = new Date();
    await internship.save();

    res.json({ internship });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export { UpdateInternshipsDetails };
