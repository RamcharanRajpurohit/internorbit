"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const create_1 = __importDefault(require("../controller/student/create"));
const get_1 = __importDefault(require("../controller/student/get"));
const update_1 = __importDefault(require("../controller/student/update"));
const search_1 = __importDefault(require("../controller/student/search"));
exports.router = (0, express_1.Router)();
// Get student profile
exports.router.get('/', auth_1.verifyToken, get_1.default);
// Create student profile
exports.router.post('/', auth_1.verifyToken, create_1.default);
// Update student profile
exports.router.put('/', auth_1.verifyToken, update_1.default);
// Search students by skills
exports.router.get('/search', search_1.default);
exports.default = exports.router;
