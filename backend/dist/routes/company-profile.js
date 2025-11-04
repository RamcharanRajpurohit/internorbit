"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const get_1 = require("../controller/company/get");
const create_1 = require("../controller/company/create");
const update_1 = require("../controller/company/update");
const get_2 = require("../controller/company/public/get");
const search_1 = require("../controller/company/public/search");
const delete_1 = require("../controller/company/delete");
const router = (0, express_1.Router)();
// Get company profile
router.get('/', auth_1.verifyToken, get_1.getCompanyProfile);
// Create company profile
router.post('/', auth_1.verifyToken, create_1.createCompanyProfile);
// Update company profile
router.put('/', auth_1.verifyToken, update_1.updateCompanyProfile);
// Get company profile by ID (public)
router.get('/public/:user_id', get_2.getCompanyProfilebyId);
// Search companies
router.get('/search', search_1.searchCompaniesWithFilter);
router.delete('/', auth_1.verifyToken, delete_1.deleteCompanyProfile);
exports.default = router;
