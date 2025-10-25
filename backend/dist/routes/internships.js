"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/internships.ts
const express_1 = require("express");
const internships_1 = require("../models/internships");
const profile_1 = require("../models/profile");
const company_profile_1 = require("../models/company-profile");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all active internships with pagination and filters
router.get('/', async (req, res) => {
    const { page = 1, limit = 10, search, location, skills, remote } = req.query;
    try {
        const skip = (Number(page) - 1) * Number(limit);
        const query = { status: 'active' };
        // Apply filters
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (remote === 'true') {
            query.is_remote = true;
        }
        if (skills) {
            const skillsArray = skills.split(',');
            query.skills_required = { $in: skillsArray };
        }
        const total = await internships_1.Internship.countDocuments(query);
        const internships = await internships_1.Internship.find(query)
            .populate({
            path: 'company_id',
            select: 'email full_name',
            model: profile_1.Profile
        })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(Number(limit));
        // Populate company profiles
        const populatedInternships = await Promise.all(internships.map(async (internship) => {
            const companyProfile = await company_profile_1.CompanyProfile.findOne({
                user_id: internship.company_id
            });
            return {
                ...internship.toObject(),
                company: {
                    ...internship.company_id.toObject(),
                    company_profiles: companyProfile ? [companyProfile] : []
                }
            };
        }));
        res.json({
            internships: populatedInternships,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Error fetching internships:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get single internship
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const internship = await internships_1.Internship.findById(id)
            .populate({
            path: 'company_id',
            select: 'email full_name',
            model: profile_1.Profile
        });
        if (!internship || internship.status !== 'active') {
            return res.status(404).json({ error: 'Internship not found' });
        }
        // Get company profile
        const companyProfile = await company_profile_1.CompanyProfile.findOne({
            user_id: internship.company_id
        });
        // Increment views
        internship.views_count += 1;
        await internship.save();
        res.json({
            internship: {
                ...internship.toObject(),
                company: {
                    ...internship.company_id.toObject(),
                    company_profiles: companyProfile ? [companyProfile] : []
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create internship (Company only)
router.post('/', auth_1.verifyToken, async (req, res) => {
    const { title, description, requirements, responsibilities, location, is_remote, stipend_min, stipend_max, duration_months, skills_required, application_deadline, positions_available, } = req.body;
    try {
        // Verify user is a company
        const company = await company_profile_1.CompanyProfile.findOne({ user_id: req.user.id });
        if (!company) {
            return res.status(404).json({ error: 'Comapany profile not found' });
        }
        const profile = await profile_1.Profile.findOne({ user_id: req.user.id });
        if (!profile || profile.role !== 'company') {
            return res.status(403).json({ error: 'Only companies can post internships' });
        }
        const internship = new internships_1.Internship({
            company_id: company._id,
            title,
            description,
            requirements: requirements || [],
            responsibilities: responsibilities || [],
            location,
            is_remote: is_remote || false,
            stipend_min,
            stipend_max,
            duration_months,
            skills_required: skills_required || [],
            application_deadline,
            positions_available: positions_available || 1,
            status: 'draft',
        });
        await internship.save();
        res.status(201).json({ internship });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update internship (Company only)
router.put('/:id', auth_1.verifyToken, async (req, res) => {
    const company = await company_profile_1.CompanyProfile.findOne({ user_id: req.user.id });
    if (!company) {
        return res.status(404).json({ error: 'Comapany profile not found' });
    }
    const { id } = req.params;
    const updates = req.body;
    try {
        const internship = await internships_1.Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ error: 'Internship not found' });
        }
        if (internship.company_id.toString() !== company._id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        Object.assign(internship, updates);
        internship.updated_at = new Date();
        await internship.save();
        res.json({ internship });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Publish internship
router.patch('/:id/publish', auth_1.verifyToken, async (req, res) => {
    const { id } = req.params;
    const company = await company_profile_1.CompanyProfile.findOne({ user_id: req.user.id });
    if (!company) {
        return res.status(404).json({ error: 'Comapany profile not found' });
    }
    try {
        const internship = await internships_1.Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ error: 'Internship not found' });
        }
        if (internship.company_id.toString() !== company._id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        internship.status = 'active';
        internship.updated_at = new Date();
        await internship.save();
        res.json({ internship });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete internship
router.delete('/:id', auth_1.verifyToken, async (req, res) => {
    const { id } = req.params;
    const company = await company_profile_1.CompanyProfile.findOne({ user_id: req.user.id });
    if (!company) {
        return res.status(404).json({ error: 'Comapany profile not found' });
    }
    try {
        const internship = await internships_1.Internship.findById(id);
        if (!internship) {
            return res.status(404).json({ error: 'Internship not found' });
        }
        if (internship.company_id.toString() !== company._id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await internship.deleteOne();
        res.json({ message: 'Internship deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
