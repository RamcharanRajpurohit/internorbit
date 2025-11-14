import { Request, Response } from 'express';
import { SavedInternship } from '../../../../models/saved';
import { StudentProfile } from '../../../../models/studnet';
import { Internship } from '../../../../models/internships';
import { Application } from '../../../../models/applications';

interface AuthRequest extends Request {
  user?: any;
}


const SaveInternship =async (req: AuthRequest, res: Response) => {
  const { internship_id } = req.body;
  if (!internship_id) {
    return res.status(400).json({ error: 'Internship ID is required' });
  }
  const student = await StudentProfile.findOne({ user_id: req.user.id });
  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  try {
    const saved = new SavedInternship({
      student_id: student._id,
      internship_id: internship_id,
    });

    await saved.save();

    // Get FULL internship details with populated company data
    const internship = await Internship.findById(internship_id)
      .populate('company_id', 'company_name logo_url location industry')
      .lean();
    
    // Check if student has applied to this internship
    const application = await Application.findOne({
      internship_id: internship_id,
      student_id: student._id,
    });

    res.status(201).json({ 
      saved,
      internship: internship ? {
        ...internship,
        is_saved: true, // Just saved
        has_applied: !!application,
      } : null,
      message: 'Internship saved successfully'
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already saved this internship' });
    }
    res.status(500).json({ error: error.message });
  }
}

export { SaveInternship };