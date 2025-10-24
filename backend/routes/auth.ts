import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Middleware to verify JWT token
export const verifyToken = async (req: AuthRequest, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token verification failed' });
  }
};

// Get current user
router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  const { full_name, avatar_url } = req.body;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, avatar_url, updated_at: new Date() })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;