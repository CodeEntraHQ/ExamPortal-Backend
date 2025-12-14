import { Router } from "express";

import {
  createExamMonitoring,
  getMonitoringByEnrollment,
} from "#controllers/examMonitoring.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";

const router = Router();

// Create monitoring record (called by client during exam)
router.route("/").post(verifyJWT, createExamMonitoring);

// Get monitoring records for an enrollment
router.route("/:enrollmentId").get(verifyJWT, getMonitoringByEnrollment);

export default router;
