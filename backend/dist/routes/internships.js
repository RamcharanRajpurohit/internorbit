"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
// backend/routes/internships.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const get_1 = require("../controller/internships/get");
const create_1 = require("../controller/internships/create");
const update_1 = require("../controller/internships/update");
const getOne_1 = require("../controller/internships/getOne");
const publish_1 = require("../controller/internships/publish");
const delete_1 = require("../controller/internships/delete");
exports.router = (0, express_1.Router)();
// Get all active internships with pagination and filters
// Uses optionalAuth to allow both authenticated and guest users
// If authenticated, has_applied will be checked; if guest, has_applied will be false
exports.router.get("/", auth_1.optionalAuth, get_1.getAllInternships);
exports.router.get("/company", auth_1.verifyToken, get_1.getAllByCompanyId);
// Get single internship - Uses optionalAuth for same reason
exports.router.get("/:id", auth_1.optionalAuth, getOne_1.getOneInternship);
// Create internship (Company only)
exports.router.post("/", auth_1.verifyToken, create_1.CreateInternships);
// Update internship (Company only)
exports.router.put("/:id", auth_1.verifyToken, update_1.UpdateInternshipsDetails);
// Publish internship
exports.router.patch("/:id/publish", auth_1.verifyToken, publish_1.PublishInternship);
// Delete internship
exports.router.delete("/:id", auth_1.verifyToken, delete_1.DeleteInternship);
exports.default = exports.router;
