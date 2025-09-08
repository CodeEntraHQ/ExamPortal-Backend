import { Router } from "express";
import { verifyJWT } from "#middleware/auth.middleware.js";
import { onboardCollege } from "#controllers/colleges/onboardCollege.controller.js";
import { getColleges } from "#controllers/colleges/getColleges.controller.js";

const router = Router();

router.route("/colleges").post(verifyJWT, onboardCollege);
router.route("/colleges").get(verifyJWT, getColleges);

export default router;
