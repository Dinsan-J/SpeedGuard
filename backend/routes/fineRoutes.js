import express from "express";
import {
  issueFine,
  getFinesByPlate,
  getFinesByOfficer,
} from "../controllers/fineController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/issue", protect, issueFine); // Officer-only
router.get("/plate/:plateNumber", protect, getFinesByPlate); // For logged-in user
router.get("/officer", protect, getFinesByOfficer); // Officer-only

export default router;
