import { Router, Request } from 'express';
import { verifyToken } from '../middleware/auth';
import { getApplicationsbyId } from '../controller/applications/common/get';
import { getAllStudentApplications } from '../controller/applications/student/get';
import { getAllCompanyApplications } from '../controller/applications/company/get';
import { createApplication } from '../controller/applications/student/create';
import { updateApplicationStatus } from '../controller/applications/company/updateStatus';
import { withDrawApplication } from '../controller/applications/student/withdrawApplication';

const router = Router();
// Get student's applications
router.get('/student', verifyToken,getAllStudentApplications );

// Get company's applications
router.get('/company', verifyToken,getAllCompanyApplications );

// Create application
router.post('/', verifyToken, createApplication);

// Update application status (Company only)
router.patch('/:id/status', verifyToken, updateApplicationStatus);

// Withdraw application (Student only)
router.delete('/:id', verifyToken, withDrawApplication);

// Get single application (Student or Company)
router.get('/:id', verifyToken,getApplicationsbyId );

export default router;