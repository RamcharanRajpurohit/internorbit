"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.verifyToken = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
}
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // Verify token with Supabase
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = data.user;
        next();
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Token verification failed' });
    }
};
exports.verifyToken = verifyToken;
/**
 * Optional authentication middleware
 * Allows requests with or without authentication token
 * If token is provided and valid, sets req.user
 * If no token or invalid token, continues without req.user
 */
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    // No token provided - continue as guest
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        // Try to verify token with Supabase
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
            // Valid token - set user
            req.user = data.user;
        }
        // Invalid token - continue without user (no error thrown)
        next();
    }
    catch (error) {
        console.error('Optional auth error:', error);
        // Error verifying token - continue without user
        next();
    }
};
exports.optionalAuth = optionalAuth;
