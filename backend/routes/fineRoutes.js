import express from "express";
import { issueFine, getFinesByPlate } from "../controllers/fineController.js";
import { protect, officerOnly } from "../middleware/authMiddleware.js";
import { getFinesByOfficer } from "../controllers/fineController.js";

const router = express.Router();

// Only officers can issue fines
router.post("/issue", protect, officerOnly, issueFine);

// Any authenticated user can view fines by plate number
router.get("/:plateNumber", protect, getFinesByPlate);

// Officers can view fines they've issued
router.get("/officer/my-fines", protect, officerOnly, getFinesByOfficer);

export default router;
