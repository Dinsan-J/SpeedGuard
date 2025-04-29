import express from "express";
import {
  addSpeedLog,
  getSpeedLogs,
} from "../controllers/speedLogController.js";

const router = express.Router();

router.post("/add", addSpeedLog); // simulate IoT
router.get("/:plateNumber", getSpeedLogs); // view logs by plate

export default router;
