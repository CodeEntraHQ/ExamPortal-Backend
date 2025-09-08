import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  createExam,
  fetchExams,
  submitExam,
} from "../controllers/exam.controller.js";

import {
  createQuestion,
  getQuestionsByExamID,
  getQuestions,
} from "../controllers/questions.controllers.js";

import { inviteStudent } from "../controllers/enrolled.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createExam);
router.route("/invite").post(verifyJWT, inviteStudent);
router.route("/question").post(verifyJWT, createQuestion);
router.route("/submit").post(verifyJWT, submitExam);

router.route("/:examId/questions").get(verifyJWT, getQuestionsByExamID);
router.route("/question").get(verifyJWT, getQuestions);
router.route("/").get(verifyJWT, fetchExams);

export default router;
