import { Router } from 'express';
import { verifyToken } from '../middleware/auth';

import CreateStudentProfile from '../controller/student/create';
import GetStudentProfile from '../controller/student/get';
import updateStudentProfile from '../controller/student/update';
import SearchStudentProfile from '../controller/student/search';

export const router = Router();

// Get student profile
router.get('/', verifyToken,GetStudentProfile);

// Create student profile
router.post('/', verifyToken, CreateStudentProfile);

// Update student profile
router.put('/', verifyToken,updateStudentProfile);

// Search students by skills
router.get('/search', SearchStudentProfile);

export default router;