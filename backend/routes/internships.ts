import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { verifyToken } from './auth';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Get all active internships with pagination and filters
router.get('/', async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search, location, skills, remote } = req.query;
  
  try {
    let query = supabase
      .from('internships')
      .select(`
        *,
        company:company_id (
          id,
          email,
          full_name,
          company_profiles (
            company_name,
            logo_url,
            industry,
            description
          )
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (remote === 'true') {
      query = query.eq('is_remote', true);
    }

    if (skills) {
      const skillsArray = (skills as string).split(',');
      query = query.contains('skills_required', skillsArray);
    }

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      internships: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single internship
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('internships')
      .select(`
        *,
        company:company_id (
          id,
          email,
          full_name,
          company_profiles (
            company_name,
            logo_url,
            industry,
            description,
            website
          )
        )
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) throw error;

    // Increment views count
    await supabase
      .from('internships')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', id);

    res.json({ internship: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create internship (Company only)
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  const {
    title,
    description,
    requirements,
    responsibilities,
    location,
    is_remote,
    stipend_min,
    stipend_max,
    duration_months,
    skills_required,
    application_deadline,
    positions_available,
  } = req.body;

  try {
    // Verify user is a company
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profile?.role !== 'company') {
      return res.status(403).json({ error: 'Only companies can post internships' });
    }

    const { data, error } = await supabase
      .from('internships')
      .insert({
        company_id: req.user.id,
        title,
        description,
        requirements: requirements || [],
        responsibilities: responsibilities || [],
        location,
        is_remote: is_remote || false,
        stipend_min,
        stipend_max,
        duration_months,
        skills_required: skills_required || [],
        application_deadline,
        positions_available: positions_available || 1,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ internship: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update internship (Company only)
router.put('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Verify ownership
    const { data: internship } = await supabase
      .from('internships')
      .select('company_id')
      .eq('id', id)
      .single();

    if (internship?.company_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('internships')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ internship: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Publish internship
router.patch('/:id/publish', verifyToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const { data: internship } = await supabase
      .from('internships')
      .select('company_id, status')
      .eq('id', id)
      .single();

    if (internship?.company_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('internships')
      .update({ status: 'active', updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ internship: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete internship
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const { data: internship } = await supabase
      .from('internships')
      .select('company_id')
      .eq('id', id)
      .single();

    if (internship?.company_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await supabase
      .from('internships')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Internship deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;