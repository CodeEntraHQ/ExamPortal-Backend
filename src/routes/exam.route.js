import { Router } from "express";
import { verifyJWT } from "#middleware/auth.middleware.js";
import {
  createQuestion,
  getQuestionsByExamID,
  getQuestions,
} from "#controllers/exam.controller.js";

import { inviteStudent } from "#controllers/enrolled.controller.js";
import { createExam } from "#controllers/exams/createExam.controller.js";
import { getExams } from "#controllers/exams/getExams.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createExam);
router.route("/").get(verifyJWT, getExams);
router.route("/invite").post(verifyJWT, inviteStudent);
router.route("/question").post(verifyJWT, createQuestion);
router.route("/:examId/questions").get(verifyJWT, getQuestionsByExamID);
router.route("/question").get(verifyJWT, getQuestions);

export default router;
