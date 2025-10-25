"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const swipe_1 = require("../models/swipe");
const saved_1 = require("../models/saved");
const studnet_1 = require("../models/studnet");
const router = (0, express_1.Router)();
// ============ SWIPES ============
// Create swipe
router.post('/swipes', auth_1.verifyToken, async (req, res) => {
    const { internship_id, direction } = req.body;
    const student = await studnet_1.StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
    }
    if (!['left', 'right'].includes(direction)) {
        return res.status(400).json({ error: 'Invalid swipe direction' });
    }
    try {
        const swipe = new swipe_1.Swipe({
            student_id: req.user.id,
            internship_id,
            direction,
        });
        await swipe.save();
        // If right swipe, also save the job
        if (direction === 'right') {
            const saved = new saved_1.SavedInternship({
                student_id: student._id,
                internship_id,
            });
            await saved.save().catch(() => {
                // Ignore if already saved
            });
        }
        res.status(201).json({ swipe });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Already swiped on this internship' });
        }
        res.status(500).json({ error: error.message });
    }
});
// Get student's swipes
router.get('/swipes', auth_1.verifyToken, async (req, res) => {
    const { direction, page = 1, limit = 20 } = req.query;
    console.log(req.user.id);
    try {
        const skip = (Number(page) - 1) * Number(limit);
        const student = await studnet_1.StudentProfile.findOne({ user_id: req.user.id });
        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }
        let query = { student_id: student._id };
        if (direction) {
            query.direction = direction;
        }
        const total = await swipe_1.Swipe.countDocuments(query);
        const swipes = await swipe_1.Swipe.find(query)
            .populate({
            path: 'internship_id',
            select: 'id title location is_remote',
        })
            .sort({ swiped_at: -1 })
            .skip(skip)
            .limit(Number(limit));
        res.json({
            swipes,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get swipe stats for an internship
router.get('/swipes/stats/:internship_id', async (req, res) => {
    const { internship_id } = req.params;
    try {
        const rightSwipes = await swipe_1.Swipe.countDocuments({
            internship_id,
            direction: 'right',
        });
        const leftSwipes = await swipe_1.Swipe.countDocuments({
            internship_id,
            direction: 'left',
        });
        const total = rightSwipes + leftSwipes;
        const interestRate = total > 0 ? (rightSwipes / total) * 100 : 0;
        res.json({
            stats: {
                right: rightSwipes,
                left: leftSwipes,
                total,
                interestRate: Math.round(interestRate * 10) / 10,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ============ SAVED JOBS ============
// Save internship
router.post('/saved-jobs', auth_1.verifyToken, async (req, res) => {
    const { internship_id } = req.body;
    const student = await studnet_1.StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
    }
    try {
        const saved = new saved_1.SavedInternship({
            student_id: student._id,
            internship_id,
        });
        await saved.save();
        res.status(201).json({ saved });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Already saved this internship' });
        }
        res.status(500).json({ error: error.message });
    }
});
// Get saved internships
router.get('/saved-jobs', auth_1.verifyToken, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const skip = (Number(page) - 1) * Number(limit);
        const student = await studnet_1.StudentProfile.findOne({ user_id: req.user.id });
        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }
        const total = await saved_1.SavedInternship.countDocuments({ student_id: student._id });
        const saved = await saved_1.SavedInternship.find({ student_id: student._id })
            .populate({
            path: 'internship_id',
            populate: {
                path: 'company_id',
                select: 'email full_name',
                populate: {
                    path: 'company_profiles',
                    model: 'CompanyProfile',
                },
            },
        })
            .sort({ saved_at: -1 })
            .skip(skip)
            .limit(Number(limit));
        res.json({
            saved,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Check if internship is saved
router.get('/saved-jobs/:internship_id', auth_1.verifyToken, async (req, res) => {
    const { internship_id } = req.params;
    const student = await studnet_1.StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
    }
    try {
        const saved = await saved_1.SavedInternship.findOne({
            student_id: student._id,
            internship_id,
        });
        res.json({ isSaved: !!saved });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.delete('/saved-jobs/:internship_id', auth_1.verifyToken, async (req, res) => {
    const { internship_id } = req.params;
    const student = await studnet_1.StudentProfile.findOne({ user_id: req.user.id });
    if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
    }
    try {
        await saved_1.SavedInternship.findOneAndDelete({
            student_id: student._id,
            internship_id,
        });
        res.json({ message: 'Internship unsaved' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
