"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_1 = require("../models/profile");
const auth_1 = require("../middleware/auth");
const studnet_1 = require("../models/studnet");
const company_profile_1 = require("../models/company-profile");
const router = (0, express_1.Router)();
// ✅ Check if profile exists (for OAuth callback)
router.get('/profile', auth_1.verifyToken, async (req, res) => {
    try {
        const profile = await profile_1.Profile.findOne({ user_id: req.user.id });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found', exists: false });
        }
        res.json({ profile, exists: true });
    }
    catch (error) {
        console.error('Profile check error:', error);
        res.status(500).json({ error: error.message || 'Failed to check profile' });
    }
});
// ✅ Initialize/Create profile after Supabase auth
router.post('/initialize', auth_1.verifyToken, async (req, res) => {
    const { id, email, full_name, role, avatar_url } = req.body;
    console.log("Initializing profile for user ID:", id);
    try {
        // 🔍 Check if profile already exists by Supabase user_id
        let profile = await profile_1.Profile.findOne({ user_id: id });
        if (profile) {
            return res.json({ profile, message: 'Profile already exists' });
        }
        // 🆕 Create new profile
        profile = new profile_1.Profile({
            user_id: id, // 👈 NOT _id anymore
            email,
            full_name: full_name || email.split('@')[0],
            role: role || 'student',
            avatar_url: avatar_url || null,
        });
        await profile.save();
        // Create associated empty/minimal profiles based on role
        try {
            const effectiveRole = role || profile.role;
            if (effectiveRole === 'student') {
                const existingStudent = await studnet_1.StudentProfile.findOne({ user_id: id });
                if (!existingStudent) {
                    // Student schema allows minimal creation with only user_id
                    const studentProfile = new studnet_1.StudentProfile({ user_id: id });
                    await studentProfile.save();
                    console.log(`Created StudentProfile for user ${id}`);
                }
            }
            else if (effectiveRole === 'company') {
                const existingCompany = await company_profile_1.CompanyProfile.findOne({ user_id: id });
                if (!existingCompany) {
                    // Company schema requires company_name and company_size. Use sensible defaults.
                    const companyName = full_name || (email ? email.split('@')[0] : `Company-${id}`);
                    const companyProfile = new company_profile_1.CompanyProfile({
                        user_id: id,
                        company_name: companyName,
                        company_size: '1-10', // default placeholder to satisfy enum requirement
                    });
                    await companyProfile.save();
                    console.log(`Created CompanyProfile for user ${id}`);
                }
            }
        }
        catch (auxErr) {
            // Log the auxiliary profile creation error but don't fail the main initialization
            console.warn('Auxiliary profile creation warning:', auxErr?.message || auxErr);
        }
        res.status(201).json({ profile, message: 'Profile created successfully' });
    }
    catch (error) {
        console.error('Profile creation error:', error);
        res.status(500).json({ error: error.message || 'Failed to create profile' });
    }
});
// ✅ Get current user profile
router.get('/me', auth_1.verifyToken, async (req, res) => {
    try {
        const profile = await profile_1.Profile.findOne({ user_id: req.user.id });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json({ user: profile });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ✅ Update user profile
router.put('/me', auth_1.verifyToken, async (req, res) => {
    const { full_name, avatar_url } = req.body;
    try {
        const profile = await profile_1.Profile.findOneAndUpdate({ user_id: req.user.id }, // 👈 using user_id instead of _id
        { full_name, avatar_url, updated_at: new Date() }, { new: true, runValidators: true });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json({ user: profile });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
