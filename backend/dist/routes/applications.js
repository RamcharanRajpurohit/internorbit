"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const get_1 = require("../controller/applications/common/get");
const get_2 = require("../controller/applications/student/get");
const get_3 = require("../controller/applications/company/get");
const create_1 = require("../controller/applications/student/create");
const updateStatus_1 = require("../controller/applications/company/updateStatus");
const withdrawApplication_1 = require("../controller/applications/student/withdrawApplication");
const router = (0, express_1.Router)();
// Get student's applications
router.get('/student', auth_1.verifyToken, get_2.getAllStudentApplications);
// Get company's applications
router.get('/company', auth_1.verifyToken, get_3.getAllCompanyApplications);
// Create application
router.post('/', auth_1.verifyToken, create_1.createApplication);
// Update application status (Company only)
router.patch('/:id/status', auth_1.verifyToken, updateStatus_1.updateApplicationStatus);
// Withdraw application (Student only)
router.delete('/:id', auth_1.verifyToken, withdrawApplication_1.withDrawApplication);
// Get single application (Student or Company)
router.get('/:id', auth_1.verifyToken, get_1.getApplicationsbyId);
exports.default = router;
