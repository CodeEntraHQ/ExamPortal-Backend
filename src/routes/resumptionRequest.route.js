import { Router } from "express";

import { approveResumption } from "#controllers/resumptionRequests/approveResumption.controller.js";
import { getPendingResumptionRequests } from "#controllers/resumptionRequests/getPendingResumptionRequests.controller.js";
import { getResumptionRequest } from "#controllers/resumptionRequests/getResumptionRequest.controller.js";
import { invalidateResumptionRequest } from "#controllers/resumptionRequests/invalidateResumptionRequest.controller.js";
import { rejectResumption } from "#controllers/resumptionRequests/rejectResumption.controller.js";
import { requestResumption } from "#controllers/resumptionRequests/requestResumption.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";

const router = Router();

// Student routes
router.post("/request", verifyJWT, requestResumption);
router.post("/invalidate", verifyJWT, invalidateResumptionRequest);
router.get("/:enrollment_id", verifyJWT, getResumptionRequest);

// Admin routes
router.get("/exam/:exam_id/pending", verifyJWT, getPendingResumptionRequests);
router.post("/approve", verifyJWT, approveResumption);
router.post("/reject", verifyJWT, rejectResumption);

export default router;
