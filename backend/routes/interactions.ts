import { Router} from 'express';
import { verifyToken } from '../middleware/auth';
import { createSwipe ,getSwipes, getSwipeStats} from '../controller/interactions/student/internship-swipe/get';
import { deleteSavedInternshipbyId, isSavedInternship,getSavedInternships,SaveInternship } from '../controller/interactions/student/internship-save/get.saved';


const router = Router();
// ============ SWIPES ============

// Create swipe
router.post('/swipes', verifyToken, createSwipe);

// Get student's swipes
router.get('/swipes', verifyToken, getSwipes);

// Get swipe stats for an internship
router.get('/swipes/stats/:internship_id', getSwipeStats);

// ============ SAVED JOBS ============

// Save internship
router.post('/saved-jobs', verifyToken, SaveInternship);

// Get saved internships
router.get('/saved-jobs', verifyToken,getSavedInternships );

// Check if internship is saved
router.get('/saved-jobs/:internship_id', verifyToken,isSavedInternship);


router.delete('/saved-jobs/:internship_id', verifyToken,deleteSavedInternshipbyId );

export default router;