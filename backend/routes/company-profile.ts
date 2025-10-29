import { Router} from 'express';
import { verifyToken } from '../middleware/auth';
import { getCompanyProfile } from '../controller/company/get';
import { createCompanyProfile } from '../controller/company/create';
import { updateCompanyProfile } from '../controller/company/update';
import { getCompanyProfilebyId } from '../controller/company/public/get';
import { searchCompaniesWithFilter } from '../controller/company/public/search';
import { deleteCompanyProfile } from '../controller/company/delete';

const router = Router();


// Get company profile
router.get('/', verifyToken,getCompanyProfile );

// Create company profile
router.post('/', verifyToken,createCompanyProfile );

// Update company profile
router.put('/', verifyToken,updateCompanyProfile);

// Get company profile by ID (public)
router.get('/public/:user_id',getCompanyProfilebyId);

// Search companies
router.get('/search',searchCompaniesWithFilter );

router.delete('/', verifyToken,deleteCompanyProfile);

export default router;