import { Response } from 'express';
import { Profile } from '../../models/profile';
import { StudentProfile } from '../../models/studnet';
import { CompanyProfile } from '../../models/company-profile';
import { Resume } from '../../models/resume';
import { Application } from '../../models/applications';
import { Internship } from '../../models/internships';
import { SavedInternship } from '../../models/saved';
import { Swipe } from '../../models/swipe';
import { ResumeShare } from '../../models/resume-share';
import { ResumeAccessLog } from '../../models/resume-access-log';
import { ResumeStats } from '../../models/resume-stats';
import { supabase } from '../../config/supabase';
import { AuthRequest } from '../../middleware/auth';

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[DELETE ACCOUNT] Starting deletion for user: ${userId}`);

    // 1. Get profile to determine role
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const role = profile.role;

    // 2. Delete role-specific data
    if (role === 'student') {
      // Get student profile to get MongoDB _id
      const studentProfile = await StudentProfile.findOne({ user_id: userId });
      if (studentProfile) {
        const studentMongoId = studentProfile._id;

        // Delete student applications (uses MongoDB _id)
        await Application.deleteMany({ student_id: studentMongoId });
        console.log(`[DELETE ACCOUNT] Deleted student applications`);

        // Delete saved internships (uses MongoDB _id)
        await SavedInternship.deleteMany({ student_id: studentMongoId });
        console.log(`[DELETE ACCOUNT] Deleted saved internships`);

        // Delete swipes (uses MongoDB _id)
        await Swipe.deleteMany({ student_id: studentMongoId });
        console.log(`[DELETE ACCOUNT] Deleted swipes`);

        // Delete resume shares (uses MongoDB _id)
        await ResumeShare.deleteMany({ student_id: studentMongoId });
        console.log(`[DELETE ACCOUNT] Deleted resume shares`);

        // Delete resume access logs (uses user_id UUID)
        await ResumeAccessLog.deleteMany({ student_id: userId });
        console.log(`[DELETE ACCOUNT] Deleted resume access logs`);

        // Delete resume stats (uses MongoDB _id)
        await ResumeStats.deleteMany({ student_id: studentMongoId });
        console.log(`[DELETE ACCOUNT] Deleted resume stats`);

        // Delete resumes (uses MongoDB _id)
        await Resume.deleteMany({ student_id: studentMongoId });
        console.log(`[DELETE ACCOUNT] Deleted resumes`);
      }

      // Delete student profile
      await StudentProfile.deleteOne({ user_id: userId });
      console.log(`[DELETE ACCOUNT] Deleted student profile`);
    } else if (role === 'company') {
      // Get company profile to get MongoDB _id
      const companyProfile = await CompanyProfile.findOne({ user_id: userId });
      if (companyProfile) {
        const companyMongoId = companyProfile._id;

        // Delete applications for company's internships (uses company MongoDB _id)
        const companyInternships = await Internship.find({ company_id: companyMongoId });
        const internshipIds = companyInternships.map((i: any) => i._id);
        await Application.deleteMany({ internship_id: { $in: internshipIds } });
        console.log(`[DELETE ACCOUNT] Deleted applications for company internships`);

        // Delete saved internships for company's internships
        await SavedInternship.deleteMany({ internship_id: { $in: internshipIds } });
        console.log(`[DELETE ACCOUNT] Deleted saved references to company internships`);

        // Delete swipes for company's internships
        await Swipe.deleteMany({ internship_id: { $in: internshipIds } });
        console.log(`[DELETE ACCOUNT] Deleted swipes for company internships`);

        // Delete internships (uses company MongoDB _id)
        await Internship.deleteMany({ company_id: companyMongoId });
        console.log(`[DELETE ACCOUNT] Deleted internships`);

        // Delete resume access logs where company accessed (uses company MongoDB _id)
        await ResumeAccessLog.deleteMany({ company_id: companyMongoId });
        console.log(`[DELETE ACCOUNT] Deleted resume access logs`);
      }

      // Delete company profile
      await CompanyProfile.deleteOne({ user_id: userId });
      console.log(`[DELETE ACCOUNT] Deleted company profile`);
    }

    // 3. Delete main profile
    await Profile.deleteOne({ user_id: userId });
    console.log(`[DELETE ACCOUNT] Deleted main profile`);

    // 4. Delete from Supabase Auth
    const { error: supabaseError } = await supabase.auth.admin.deleteUser(userId);
    if (supabaseError) {
      console.error(`[DELETE ACCOUNT] Supabase deletion error:`, supabaseError);
      // Continue anyway - MongoDB data is already deleted
    } else {
      console.log(`[DELETE ACCOUNT] Deleted from Supabase auth`);
    }

    console.log(`[DELETE ACCOUNT] Account deletion completed for user: ${userId}`);
    
    res.status(200).json({ 
      message: 'Account deleted successfully',
      deleted: true 
    });
  } catch (error) {
    console.error('[DELETE ACCOUNT] Error:', error);
    res.status(500).json({ 
      error: 'Failed to delete account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
