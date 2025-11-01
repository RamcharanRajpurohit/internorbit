import { Request, Response } from 'express';
import { SavedInternship } from '../../../../models/saved';
import { StudentProfile } from '../../../../models/studnet';

interface AuthRequest extends Request {
  user?: any;
}




const isSavedInternship =  async (req: AuthRequest, res: Response) => {
  const { internship_id } = req.params;
  const student = await StudentProfile.findOne({ user_id: req.user.id });
  if (!student) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  try {
    const saved = await SavedInternship.findOne({
      student_id: student._id,
      internship_id,
    });

    res.json({ isSaved: !!saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { isSavedInternship };