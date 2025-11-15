import { Router,  } from 'express';
import { verifyToken,  } from '../middleware/auth';
import { getCurrentUser, updateCurrentUser } from '../controller/auth/currentUser';
import { getCurrentUserProfile } from '../controller/auth/getProfile';
import { initUserProfile } from '../controller/auth/initProfile';
import { deleteAccount } from '../controller/auth/deleteAccount';

const router = Router();

//  Check if profile exists (for OAuth callback)
router.get('/profile', verifyToken, getCurrentUserProfile);
// Initialize/Create profile after Supabase auth
router.post('/initialize', verifyToken, initUserProfile);


// Get current user profile
router.get('/me', verifyToken,getCurrentUser);
// Update user profile
router.put('/me', verifyToken, updateCurrentUser);
// Delete account
router.delete('/account', verifyToken, deleteAccount);

export default router;