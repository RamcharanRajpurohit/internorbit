import { Request, Response } from 'express';
import { Application } from '../../../models/applications';
import { CompanyProfile } from '../../../models/company-profile';
import { Internship } from '../../../models/internships';
import { StudentProfile } from '../../../models/studnet';
import { Profile } from '../../../models/profile';

interface AuthRequest extends Request {
  user?: any;
}

const getAllCompanyApplications = async (req: AuthRequest, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  try {
    // Find company profile
    const company = await CompanyProfile.findOne({ user_id: req.user.id });
    if (!company) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Get company's internships
    const internships = await Internship.find({ company_id: company._id });
    const internshipIds = internships.map(i => i._id);

    if (internshipIds.length === 0) {
      return res.json({
        applications: [],
        pagination: { page: 1, limit: 10, total: 0 }
      });
    }

    // Build query
    let query: any = { internship_id: { $in: internshipIds } };
    if (status) {
      query.status = status;
    }
    
    const total = await Application.countDocuments(query);
    
    // Fetch applications with populated fields
    const applications = await Application.find(query)
      .populate({
        path: 'internship_id',
        select: 'title location duration_months stipend_min stipend_max status',
      })
      .populate({
        path: 'student_id',
        select: 'user_id bio university degree graduation_year skills location phone linkedin_url github_url',
      })
      .populate({
        path: 'resume_id',
        select: 'file_name file_path visibility scan_status views_count downloads_count uploaded_at',
      })
      .sort({ applied_at: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Convert to plain JavaScript objects for easier manipulation

    // Fetch student profile data (names and emails from Profile collection)
    const studentIds = applications.map(app => (app.student_id as any)?.user_id).filter(Boolean);
    const profiles = await Profile.find({ user_id: { $in: studentIds } })
      .select('user_id full_name email avatar_url')
      .lean();

    // Create a map for quick lookup
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));

    // Enrich applications with student names and emails
    const enrichedApplications = applications.map(app => {
      const studentProfile = app.student_id as any;
      const profile = studentProfile?.user_id ? profileMap.get(studentProfile.user_id) : null;

      return {
        ...app,
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
        // Remove the old student_id field to avoid confusion
        student_id: undefined,
      };
    });

    res.json({
      applications: enrichedApplications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching company applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications', details: error.message });
  }
};

export { getAllCompanyApplications };