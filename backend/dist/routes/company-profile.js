"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const company_profile_1 = require("../models/company-profile");
const internships_1 = require("../models/internships");
const router = (0, express_1.Router)();
// Get company profile
router.get('/', auth_1.verifyToken, async (req, res) => {
    try {
        const profile = await company_profile_1.CompanyProfile.findOne({ user_id: req.user.id });
        res.json({ profile: profile || null });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Create company profile
router.post('/', auth_1.verifyToken, async (req, res) => {
    const { company_name, description, website, industry, company_size, location, logo_url, } = req.body;
    try {
        // Check if already exists
        const existing = await company_profile_1.CompanyProfile.findOne({ user_id: req.user.id });
        if (existing) {
            return res.status(400).json({ error: 'Company profile already exists' });
        }
        const profile = new company_profile_1.CompanyProfile({
            user_id: req.user.id,
            company_name,
            description,
            website,
            industry,
            company_size,
            location,
            logo_url: logo_url || null,
        });
        await profile.save();
        res.status(201).json({ profile });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update company profile
router.put('/', auth_1.verifyToken, async (req, res) => {
    const updates = req.body;
    try {
        const profile = await company_profile_1.CompanyProfile.findOneAndUpdate({ user_id: req.user.id }, { ...updates, updated_at: new Date() }, { new: true, runValidators: true });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json({ profile });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get company profile by ID (public)
router.get('/public/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const profile = await company_profile_1.CompanyProfile.findOne({ user_id });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        const internships = await internships_1.Internship.find({
            company_id: user_id,
            status: 'active',
        }).select('id title status applications_count');
        res.json({
            profile: {
                ...profile.toObject(),
                internships,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Search companies
router.get('/search', async (req, res) => {
    const { query, industry, location, page = 1, limit = 20 } = req.query;
    try {
        const skip = (Number(page) - 1) * Number(limit);
        let searchQuery = {};
        if (query) {
            searchQuery.$or = [
                { company_name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ];
        }
        if (industry) {
            searchQuery.industry = { $regex: industry, $options: 'i' };
        }
        if (location) {
            searchQuery.location = { $regex: location, $options: 'i' };
        }
        const total = await company_profile_1.CompanyProfile.countDocuments(searchQuery);
        const companies = await company_profile_1.CompanyProfile.find(searchQuery)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(Number(limit));
        res.json({
            companies,
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
exports.default = router;
