// backend/routes/internships.ts
import { Router } from "express";
import { verifyToken, optionalAuth } from "../middleware/auth";
import { getAllByCompanyId, getAllInternships } from "../controller/internships/get";
import { CreateInternships } from "../controller/internships/create";
import { UpdateInternshipsDetails } from "../controller/internships/update";
import { getOneInternship } from "../controller/internships/getOne";
import { PublishInternship } from "../controller/internships/publish";
import { DeleteInternship } from "../controller/internships/delete";

export const router = Router();

// Get all active internships with pagination and filters
// Uses optionalAuth to allow both authenticated and guest users
// If authenticated, has_applied will be checked; if guest, has_applied will be false
router.get("/", optionalAuth, getAllInternships);
router.get("/company", verifyToken,getAllByCompanyId );

// Get single internship - Uses optionalAuth for same reason
router.get("/:id", optionalAuth, getOneInternship);

// Create internship (Company only)
router.post("/", verifyToken, CreateInternships);

// Update internship (Company only)
router.put("/:id", verifyToken, UpdateInternshipsDetails);

// Publish internship
router.patch("/:id/publish", verifyToken, PublishInternship);

// Delete internship
router.delete("/:id", verifyToken, DeleteInternship);



export default router;
