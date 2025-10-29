import { Request, Response } from 'express';
import { Application } from '../../../models/applications';
import { Internship } from '../../../models/internships';

interface AuthRequest extends Request {
  user?: any;
}

const getApplicationsbyId=async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const application = await Application.findById(id)
      .populate({
        path: 'internship_id',
        populate: {
          path: 'company_id',
          select: 'email full_name',
        },
      })
      .populate({
        path: 'student_id',
        select: 'email full_name',
      });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify access: either student or company of internship
    const internship = await Internship.findById(application.internship_id);


    //to do
    // const isStudent = application.student_id.toString() === req.user.id;
    // const isCompany = internship?.company_id.toString() === req.user.id;

    // if (!isStudent && !isCompany) {
    //   return res.status(403).json({ error: 'Not authorized' });
    // }

    res.json({ application });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { getApplicationsbyId };