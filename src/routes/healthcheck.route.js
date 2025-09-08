import { Router } from "express";
import { getAppHealth } from "#controllers/healthcheck/appHealthCheck.controller.js";
import { getDBHealth } from "#controllers/healthcheck/dbHealthCheck.controller.js";

const router = Router();

router.get("/app", getAppHealth);
router.get("/db", getDBHealth);

export default router;
