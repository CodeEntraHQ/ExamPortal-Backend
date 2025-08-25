import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  onboardColleges,
  getColleges,
} from "../controllers/college.controller.js";

const router = Router();

router.route("/colleges").post(verifyJWT, onboardColleges);
router.route("/colleges").get(verifyJWT, getColleges);

export default router;
