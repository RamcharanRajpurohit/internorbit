// backend/routes/internships.ts
import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { getAllInternships } from "../controller/internships/get";
import { CreateInternships } from "../controller/internships/create";
import { UpdateInternshipsDetails } from "../controller/internships/update";
import { getOneInternship } from "../controller/internships/getOne";
import { PublishInternship } from "../controller/internships/publish";
import { DeleteInternship } from "../controller/internships/delete";

export const router = Router();

// Get all active internships with pagination and filters
router.get("/", getAllInternships);

// Get single internship // to do  do not allow ended interships
router.get("/:id", getOneInternship);

// Create internship (Company only)
router.post("/", verifyToken, CreateInternships);

// Update internship (Company only)
router.put("/:id", verifyToken, UpdateInternshipsDetails);

// Publish internship
router.patch("/:id/publish", verifyToken, PublishInternship);

// Delete internship
router.delete("/:id", verifyToken, DeleteInternship);

export default router;
