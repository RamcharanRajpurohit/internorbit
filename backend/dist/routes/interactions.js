"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const get_1 = require("../controller/interactions/student/internship-swipe/get");
const get_saved_1 = require("../controller/interactions/student/internship-save/get.saved");
const router = (0, express_1.Router)();
// ============ SWIPES ============
// Create swipe
router.post('/swipes', auth_1.verifyToken, get_1.createSwipe);
// Get student's swipes
router.get('/swipes', auth_1.verifyToken, get_1.getSwipes);
// Get swipe stats for an internship
router.get('/swipes/stats/:internship_id', get_1.getSwipeStats);
// ============ SAVED JOBS ============
// Save internship
router.post('/saved-jobs', auth_1.verifyToken, get_saved_1.SaveInternship);
// Get saved internships
router.get('/saved-jobs', auth_1.verifyToken, get_saved_1.getSavedInternships);
// Check if internship is saved
router.get('/saved-jobs/:internship_id', auth_1.verifyToken, get_saved_1.isSavedInternship);
router.delete('/saved-jobs/:internship_id', auth_1.verifyToken, get_saved_1.deleteSavedInternshipbyId);
exports.default = router;
