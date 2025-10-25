"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const internships_1 = __importDefault(require("./routes/internships"));
const applications_1 = __importDefault(require("./routes/applications"));
const interactions_1 = __importDefault(require("./routes/interactions"));
const company_profile_1 = __importDefault(require("./routes/company-profile"));
const student_profile_1 = __importDefault(require("./routes/student-profile"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect to MongoDB
(0, database_1.connectDatabase)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        database: 'MongoDB'
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/internships', internships_1.default);
app.use('/api/applications', applications_1.default);
app.use('/api/interactions', interactions_1.default);
app.use('/api/company-profile', company_profile_1.default);
app.use('/api/student-profile', student_profile_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        timestamp: new Date(),
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 API Documentation available at http://localhost:${PORT}/api`);
    console.log(`🗄️  Database: MongoDB`);
    console.log(`🔐 Auth: Supabase JWT`);
});
