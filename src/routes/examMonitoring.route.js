import { Router } from "express";

import {
  createOrUpdateExamMonitoring,
  getMonitoringByEnrollment,
  getMonitoringByExam,
} from "#controllers/examMonitoring.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";

const router = Router();

// Create or update monitoring record (called by client during exam)
router.route("/").post(verifyJWT, createOrUpdateExamMonitoring);

// Get all monitoring data for an exam
router.route("/exam/:examId").get(verifyJWT, getMonitoringByExam);

// Get monitoring record for an enrollment
router.route("/:enrollmentId").get(verifyJWT, getMonitoringByEnrollment);

export default router;
