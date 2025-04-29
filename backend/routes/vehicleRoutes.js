import express from "express";
import {
  registerVehicle,
  getMyVehicles,
} from "../controllers/vehicleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", protect, registerVehicle);
router.get("/my", protect, getMyVehicles);

export default router;
