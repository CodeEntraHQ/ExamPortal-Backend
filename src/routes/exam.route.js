import { Router } from "express";
import { verifyJWT } from "#middleware/auth.middleware.js";

import { createExam } from "#controllers/exams/createExam.controller.js";
import { getExams } from "#controllers/exams/getExams.controller.js";
import { createQuestion } from "#controllers/exams/createQuestion.controller.js";
import { getQuestions } from "#controllers/exams/getQuestions.controller.js";
import { inviteStudent } from "#controllers/exams/inviteStudents.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createExam);
router.route("/").get(verifyJWT, getExams);
router.route("/question").post(verifyJWT, createQuestion);
router.route("/question").get(verifyJWT, getQuestions);
router.route("/invite").post(verifyJWT, inviteStudent);

export default router;
