import { Router, Request, Response } from 'express';
import { supabase} from '../config/supabase';
import { verifyToken } from './auth';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Get student's applications
router.get('/student', verifyToken, async (req: AuthRequest, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query;

  try {
    let query = supabase
      .from('applications')
      .select(`
        *,
        internship:internship_id (
          id,
          title,
          description,
          company_id,
          location,
          stipend_min,
          stipend_max,
          company:company_id (
            company_profiles (
              company_name,
              logo_url
            )
          )
        )
      `)
      .eq('student_id', req.user.id)
      .order('applied_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { data, error, count } = await query.range(offset, offset + Number(limit) - 1);

    if (error) throw error;

    res.json({
      applications: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get company's applications
router.get('/company', verifyToken, async (req: AuthRequest, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query;

  try {
    let query = supabase
      .from('applications')
      .select(`
        *,
        internship:internship_id (
          id,
          title,
          company_id
        ),
        student:student_id (
          id,
          email,
          full_name,
          student_profiles (
            bio,
            university,
            degree,
            skills,
            resume_url
          )
        )
      `)
      .in('internship_id', [])  // Will filter by company internships
      .order('applied_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    // Get company's internships first
    const { data: internships } = await supabase
      .from('internships')
      .select('id')
      .eq('company_id', req.user.id);

    if (!internships || internships.length === 0) {
      return res.json({ applications: [], pagination: { page: 1, limit: 10, total: 0 } });
    }

    const internshipIds = internships.map(i => i.id);

    query = query.in('internship_id', internshipIds);

    const offset = (Number(page) - 1) * Number(limit);
    const { data, error, count } = await query.range(offset, offset + Number(limit) - 1);

    if (error) throw error;

    res.json({
      applications: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create application
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  const { internship_id, cover_letter, resume_url } = req.body;

  try {
    // Verify user is a student
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profile?.role !== 'student') {
      return res.status(403).json({ error: 'Only students can apply' });
    }

    // Check if already applied
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('internship_id', internship_id)
      .eq('student_id', req.user.id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already applied to this internship' });
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        internship_id,
        student_id: req.user.id,
        cover_letter,
        resume_url,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Update internship applications count
    const { data: internship } = await supabase
      .from('internships')
      .select('applications_count')
      .eq('id', internship_id)
      .single();

    await supabase
      .from('internships')
      .update({ applications_count: (internship?.applications_count || 0) + 1 })
      .eq('id', internship_id);

    res.status(201).json({ application: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update application status (Company only)
router.patch('/:id/status', verifyToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Verify company owns this internship
    const { data: application } = await supabase
      .from('applications')
      .select('internship_id')
      .eq('id', id)
      .single();

    const { data: internship } = await supabase
      .from('internships')
      .select('company_id')
      .eq('id', application?.internship_id)
      .single();

    if (internship?.company_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ application: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw application (Student only)
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const { data: application } = await supabase
      .from('applications')
      .select('student_id, internship_id')
      .eq('id', id)
      .single();

    if (application?.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update internship applications count
    const { data: internship } = await supabase
      .from('internships')
      .select('applications_count')
      .eq('id', application?.internship_id)
      .single();

    await supabase
      .from('internships')
      .update({ applications_count: Math.max((internship?.applications_count || 1) - 1, 0) })
      .eq('id', application?.internship_id);

    res.json({ message: 'Application withdrawn' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;