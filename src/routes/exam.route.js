import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createExam,
  createQuestion,
  getQuestions,
} from "../controllers/exam.controller.js";

import { inviteStudent } from "../controllers/enrolled.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createExam);
router.route("/invite").post(verifyJWT, inviteStudent);
router.route("/question").post(verifyJWT, createQuestion);
router.route("/question").get(verifyJWT, getQuestions);

export default router;
