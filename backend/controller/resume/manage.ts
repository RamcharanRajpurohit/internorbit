import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import { Resume } from '../../models/resume';
import { ResumeAccessLog } from '../../models/resume-access-log';
import { ResumeShare } from '../../models/resume-share';
import { AuthRequest } from '../../middleware/auth';



const updateResumeVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const { resume_id } = req.params;
    const { visibility } = req.body;
    const user_id = req.user.id;

    if (!['private', 'public', 'restricted'].includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility option' });
    }

    const resume = await Resume.findOneAndUpdate(
      { _id: resume_id, user_id },
      { visibility, updated_at: new Date() },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ resume });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const deleteResume = async (req: AuthRequest, res: Response) => {
  try {
    const { resume_id } = req.params;
    const user_id = req.user.id;

    const resume = await Resume.findOneAndDelete({
      _id: resume_id,
      user_id,
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('resumes-private')
      .remove([resume.file_path]);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
    }

    // Clean up access logs and shares
    await ResumeAccessLog.deleteMany({ resume_id });
    await ResumeShare.deleteMany({ resume_id });

    res.json({ message: 'Resume deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const setPrimaryResume = async (req: AuthRequest, res: Response) => {
  try {
    const { resume_id } = req.params;
    const user_id = req.user.id;

    // Clear primary from all resumes
    await Resume.updateMany(
      { user_id },
      { is_primary: false }
    );

    // Set as primary
    const resume = await Resume.findOneAndUpdate(
      { _id: resume_id, user_id },
      { is_primary: true, updated_at: new Date() },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ resume });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export { updateResumeVisibility, deleteResume, setPrimaryResume };