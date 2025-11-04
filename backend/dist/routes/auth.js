"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const currentUser_1 = require("../controller/auth/currentUser");
const getProfile_1 = require("../controller/auth/getProfile");
const initProfile_1 = require("../controller/auth/initProfile");
const router = (0, express_1.Router)();
//  Check if profile exists (for OAuth callback)
router.get('/profile', auth_1.verifyToken, getProfile_1.getCurrentUserProfile);
// Initialize/Create profile after Supabase auth
router.post('/initialize', auth_1.verifyToken, initProfile_1.initUserProfile);
// Get current user profile
router.get('/me', auth_1.verifyToken, currentUser_1.getCurrentUser);
// Update user profile
router.put('/me', auth_1.verifyToken, currentUser_1.updateCurrentUser);
exports.default = router;
