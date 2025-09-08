import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { onboardCollege } from "../controllers/college/onboardCollege.controller.js";
import { getColleges } from "../controllers/college/getColleges.controller.js";

const router = Router();

router.route("/colleges").post(verifyJWT, onboardCollege);
router.route("/colleges").get(verifyJWT, getColleges);

export default router;
