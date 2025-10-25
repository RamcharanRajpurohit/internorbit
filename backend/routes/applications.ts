import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { Application } from '../models/applications';
import { Internship } from '../models/internships';
import { Profile } from '../models/profile';
import { StudentProfile } from '../models/studnet';
import { CompanyProfile } from '../models/company-profile';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Get student's applications
router.get('/student', verifyToken, async (req: AuthRequest, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query;
  const student = await StudentProfile.findOne({ user_id: req.user.id });
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

  try {
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = { student_id: student._id };

    if (status) {
      query.status = status;
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate({
        path: 'internship_id',
        select: 'id title description company_id location stipend_min stipend_max',
        populate: {
          path: 'company_id',
          select: 'email full_name',
          populate: {
            path: 'company_profiles',
            model: 'CompanyProfile',
            select: 'company_name logo_url',
          },
        },
      })
      .sort({ applied_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get company's applications
router.get('/company', verifyToken, async (req: AuthRequest, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query
  const company = await CompanyProfile.findOne({ user_id: req.user.id });
      if (!company) {
        return res.status(404).json({ error: 'Comapany profile not found' });
      }

  try {
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

    let query: any = { internship_id: { $in: internshipIds } };

    if (status) {
      query.status = status;
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate({
        path: 'internship_id',
        select: 'id title company_id',
      })
      .populate({
        path: 'student_id',
        select: 'email full_name',
        populate: {
          path: 'student_profiles',
          model: 'StudentProfile',
          select: 'bio university degree skills resume_url',
        },
      })
      .sort({ applied_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create application
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  const { internship_id, cover_letter, resume_url } = req.body;
  

  const student = await StudentProfile.findOne({ user_id: req.user.id });
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

  try {
    // Verify user is a student
    const profile = await Profile.findById({user_id:req.user.id});

    if (profile?.role !== 'student') {
      return res.status(403).json({ error: 'Only students can apply' });
    }

    // Check if already applied
    const existing = await Application.findOne({
      internship_id,
      student_id: student._id,
    });

    if (existing) {
      return res.status(400).json({ error: 'Already applied to this internship' });
    }

    // Create application
    const application = new Application({
      internship_id,
      student_id: req.user.id,
      cover_letter,
      resume_url,
      status: 'pending',
    });

    await application.save();

    // Update internship applications count
    const internship = await Internship.findById(internship_id);
    if (internship) {
      internship.applications_count = (internship.applications_count || 0) + 1;
      await internship.save();
    }

    res.status(201).json({ application });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update application status (Company only)
router.patch('/:id/status', verifyToken, async (req: AuthRequest, res: Response) => {
  const company = await CompanyProfile.findOne({ user_id: req.user.id });
      if (!company ) {
        return res.status(404).json({ error: 'Company  profile not found' });
      }
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Verify status is valid
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get application
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Get internship
    const internship = await Internship.findById(application.internship_id);

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Verify company owns this internship
    if (internship.company_id.toString() !== company._id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update application
    application.status = status;
    application.updated_at = new Date();
    await application.save();

    res.json({ application });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw application (Student only)
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
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

    if (application.student_id.toString() !== student._id) {
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
});

// Get single application (Student or Company)
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const application = await Application.findById(id)
      .populate({
        path: 'internship_id',
        populate: {
          path: 'company_id',
          select: 'email full_name',
        },
      })
      .populate({
        path: 'student_id',
        select: 'email full_name',
      });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify access: either student or company of internship
    const internship = await Internship.findById(application.internship_id);

    
    //to do
    // const isStudent = application.student_id.toString() === req.user.id;
    // const isCompany = internship?.company_id.toString() === req.user.id;

    // if (!isStudent && !isCompany) {
    //   return res.status(403).json({ error: 'Not authorized' });
    // }

    res.json({ application });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;