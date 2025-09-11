import { Router } from "express";
import { getAppHealth } from "#controllers/healthcheck/appHealthCheck.controller.js";
import { getDBHealth } from "#controllers/healthcheck/dbHealthCheck.controller.js";

const router = Router();

router.route("/app").get(getAppHealth);

router.route("/db").get(getDBHealth);

export default router;
