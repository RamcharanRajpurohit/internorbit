import { Request, Response } from 'express';
import { Application } from '../../../models/applications';
import { Internship } from '../../../models/internships';
import { StudentProfile } from '../../../models/studnet';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: any;
}



const withDrawApplication =async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const student = await StudentProfile.findOne({ user_id: req.user.id });
  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }
  try {
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    if (!(application.student_id.equals(student._id as mongoose.Types.ObjectId))) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete application
    await Application.findByIdAndDelete(id);

    // Update internship applications count
    const internship = await Internship.findById(application.internship_id);
    if (internship) {
      internship.applications_count = Math.max((internship.applications_count || 1) - 1, 0);
      await internship.save();
    }

    res.json({ message: 'Application withdrawn' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { withDrawApplication };