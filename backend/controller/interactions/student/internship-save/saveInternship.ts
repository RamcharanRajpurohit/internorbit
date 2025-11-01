import { Request, Response } from 'express';
import { SavedInternship } from '../../../../models/saved';
import { StudentProfile } from '../../../../models/studnet';

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

    res.status(201).json({ saved });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already saved this internship' });
    }
    res.status(500).json({ error: error.message });
  }
}

export { SaveInternship };