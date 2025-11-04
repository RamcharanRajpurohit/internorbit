import { Request, Response } from 'express';
import { Application } from '../../../models/applications';
import { Internship } from '../../../models/internships';
import { StudentProfile } from '../../../models/studnet';
import { Profile } from '../../../models/profile';
import { CompanyProfile } from '../../../models/company-profile';

interface AuthRequest extends Request {
  user?: any;
}

const getApplicationsbyId = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const application = await Application.findById(id)
      .populate({
        path: 'internship_id',
        select: 'title description location duration_months stipend_min stipend_max status company_id',
        populate: {
          path: 'company_id',
          model: 'CompanyProfile',
          select: 'company_name logo_url website industry location',
        },
      })
      .populate({
        path: 'student_id',
        select: 'user_id bio university degree graduation_year skills location phone linkedin_url github_url',
      })
      .populate({
        path: 'resume_id',
        select: 'file_name file_path file_size visibility scan_status views_count downloads_count uploaded_at',
      })
      .lean();

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Fetch student profile data (name and email from Profile collection)
    const studentProfile = application.student_id as any;
    let profile = null;
    
    if (studentProfile?.user_id) {
      profile = await Profile.findOne({ user_id: studentProfile.user_id })
        .select('user_id full_name email avatar_url')
        .lean();
    }

    // Verify access: either student or company of internship
    const internship = await Internship.findById(application.internship_id);
    const company = await CompanyProfile.findOne({ user_id: req.user.id });
    const student = await StudentProfile.findOne({ user_id: req.user.id });
    // to do
    // const isStudent = student && studentProfile?._id.toString() === student._id.toString();
    // const isCompany = company && internship?.company_id.toString() === company._id.toString();

    // if (!isStudent && !isCompany) {
    //   return res.status(403).json({ error: 'Not authorized to view this application' });
    // }

    // Enrich application with student info
    const enrichedApplication = {
      ...application,
      student: {
        _id: studentProfile?._id,
        user_id: studentProfile?.user_id,
        full_name: profile?.full_name || 'N/A',
        email: profile?.email || 'N/A',
        avatar_url: profile?.avatar_url,
        bio: studentProfile?.bio,
        university: studentProfile?.university,
        degree: studentProfile?.degree,
        graduation_year: studentProfile?.graduation_year,
        skills: studentProfile?.skills || [],
        location: studentProfile?.location,
        phone: studentProfile?.phone,
        linkedin_url: studentProfile?.linkedin_url,
        github_url: studentProfile?.github_url,
      },
      student_id: undefined, // Remove to avoid confusion
    };

    res.json({ application: enrichedApplication });
  } catch (error: any) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: error.message });
  }
};

export { getApplicationsbyId };