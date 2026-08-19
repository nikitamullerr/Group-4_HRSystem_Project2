import express from "express";
import {
  getAttendance,
  getAttendanceSummary,
  markAttendance,
} from "../controllers/attendanceController.js";
import { authenticate } from "../middleware/auth.js";

console.log("attendanceRoutes.js is being processed");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Attendance router is mounted!" });
});

router.get("/", authenticate, getAttendance);
router.get("/summary", authenticate, getAttendanceSummary);
router.post("/mark", authenticate, markAttendance);

console.log("Attendance routes defined");
export default router;
