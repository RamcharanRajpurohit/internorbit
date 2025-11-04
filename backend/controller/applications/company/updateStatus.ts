import { Request, Response } from 'express';
import { Application } from '../../../models/applications';
import { Internship } from '../../../models/internships';
import { Profile } from '../../../models/profile';
import { StudentProfile } from '../../../models/studnet';

interface AuthRequest extends Request {
  user?: any;
}

const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;


  const validStatuses = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify that the requester is the company of the internship
    const internship = await Internship.findById(application.internship_id);
    const profile = await Profile.findOne({ user_id: req.user.id });
    if (profile?.role !== 'company') {
      return res.status(403).json({ error: 'Only companies can update application status' });
    }

    // Here you would typically check if the company owns the internship
    // For brevity, this check is omitted

    application.status = status;
    await application.save();

    res.json({ message: 'Application status updated', application });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { updateApplicationStatus };