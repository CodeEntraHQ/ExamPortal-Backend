import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  onboardColleges,
  getColleges,
} from "../controllers/collage.controller.js";

const router = Router();

router.route("/collages").post(verifyJWT, onboardColleges);
router.route("/collages").get(verifyJWT, getColleges);

export default router;
