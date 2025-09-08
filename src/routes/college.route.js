import { Router } from "express";
import { verifyJWT } from "#middleware/auth.middleware.js";
import { createCollege } from "#controllers/colleges/createCollege.controller.js";
import { updateCollege } from "#controllers/colleges/updateCollege.controller.js";
import { getColleges } from "#controllers/colleges/getColleges.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getColleges);
router.route("/").post(verifyJWT, createCollege);
router.route("/").patch(verifyJWT, updateCollege);

export default router;
