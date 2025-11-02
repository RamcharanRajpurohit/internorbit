import { Response } from 'express';
import { Resume } from '../../models/resume';
import { StudentProfile } from '../../models/studnet';
import { AuthRequest } from '../../middleware/auth';

/**
 * Get all resumes for authenticated student
 * Used for dropdown in ApplyInternship page
 * Only returns 'clean' resumes
 */
const getStudentResumes = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user.id;

    // Verify student profile exists
    const student = await StudentProfile.findOne({ user_id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Get all resumes for this student (show all, not just clean)
    // Students need to see pending resumes too to know scan status
    const resumes = await Resume.find({
      user_id,
    })
      .select(
        '_id file_name uploaded_at is_primary scan_status visibility file_path file_size mime_type'
      )
      .sort({ is_primary: -1, uploaded_at: -1 }); // Primary first

    res.json({ resumes });
  } catch (error: any) {
    console.error('Get student resumes error:', error);
    res.status(500).json({ error: error.message });
  }
};

export { getStudentResumes };