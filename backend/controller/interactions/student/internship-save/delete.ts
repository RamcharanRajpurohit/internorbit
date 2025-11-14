import { Request, Response } from 'express';
import { SavedInternship } from '../../../../models/saved';
import { StudentProfile } from '../../../../models/studnet';
import { Internship } from '../../../../models/internships';
import { Application } from '../../../../models/applications';

interface AuthRequest extends Request {
  user?: any;
}



const deleteSavedInternshipbyId = async (req: AuthRequest, res: Response) => {
  const { internship_id } = req.params;
  const student = await StudentProfile.findOne({ user_id: req.user.id });
  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  try {
    await SavedInternship.findOneAndDelete({
      student_id: student._id,
      internship_id,
    });

    // Get FULL internship details with populated company data
    const internship = await Internship.findById(internship_id)
      .populate('company_id', 'company_name logo_url location industry')
      .lean();
    
    // Check if student has applied to this internship
    const application = await Application.findOne({
      internship_id: internship_id,
      student_id: student._id,
    });

    res.json({ 
      saved: null, // For consistency with save response
      message: 'Internship unsaved successfully',
      internship: internship ? {
        ...internship,
        is_saved: false, // Just unsaved
        has_applied: !!application,
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { deleteSavedInternshipbyId };