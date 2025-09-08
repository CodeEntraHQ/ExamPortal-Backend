import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { onboardColleges } from "../controllers/college/onboard.controller.js";
import { getColleges } from "../controllers/college/list.controller.js";

const router = Router();

router.route("/colleges").post(verifyJWT, onboardColleges);
router.route("/colleges").get(verifyJWT, getColleges);

export default router;
