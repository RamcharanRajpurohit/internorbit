import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import { discoverResumes } from '../controller/resume/discover';
import { getSignedUrl } from '../controller/resume/get-signed-url';
import { getResumeStats } from '../controller/resume/get-stats';
import { updateResumeVisibility, deleteResume, setPrimaryResume } from '../controller/resume/manage';
import { shareResume, revokeResumeAccess } from '../controller/resume/share-resume';
import { getCompanyAccessAnalytics } from '../controller/resume/company-analytics';
import { cleanupOldLogs } from '../controller/resume/cleanup';
import { resumeAccessLimiter, uploadLimiter } from '../middleware/rate-limit';
import { getUploadUrl } from '../controller/resume/get-upload-url';
import { confirmUpload } from '../controller/resume/confirm-upload';
import { getStudentResumes } from '../controller/resume/get-student-resume';

const router = Router();

// Company: Discover public resumes
router.get('/discover', verifyToken, discoverResumes);

// Get signed URL for view/download (with rate limiter)
// Usage: POST /resume/:resume_id/access?access_type=view&application_id=xyz (for company via app)
// Usage: POST /resume/:resume_id/access?access_type=view (for student/public)
router.post('/:resume_id/access', verifyToken, getSignedUrl);

// Student: Get resume stats
router.get('/stats', verifyToken, getResumeStats);

// Student: Update visibility
router.patch('/:resume_id/visibility', verifyToken, updateResumeVisibility);

// Student: Delete resume
router.delete('/:resume_id', verifyToken, deleteResume);

// Student: Set as primary
router.patch('/:resume_id/set-primary', verifyToken, setPrimaryResume);

// Student: Share resume
router.post('/:resume_id/share/:company_id', verifyToken, shareResume);

// Student: Revoke access
router.delete('/:resume_id/share/:company_id', verifyToken, revokeResumeAccess);

// Company: Get detailed access analytics
router.get('/analytics/access', verifyToken, getCompanyAccessAnalytics);

// Admin: Cleanup
router.post('/admin/cleanup-logs', verifyToken, cleanupOldLogs);

// Get upload URL
router.get('/get-upload-url', verifyToken, getUploadUrl);

// Confirm after frontend upload
router.post('/confirm-upload', verifyToken, confirmUpload);

// Get student's resumes
router.get('/my-resumes', verifyToken, getStudentResumes);

export default router;