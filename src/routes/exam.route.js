import { Router } from "express";
import { verifyJWT } from "#middleware/auth.middleware.js";
import { createExam } from "#controllers/exams/createExam.controller.js";
import { getExams } from "#controllers/exams/getExams.controller.js";
import { createQuestion } from "#controllers/exams/createQuestion.controller.js";
import { getQuestions } from "#controllers/exams/getQuestions.controller.js";
import { inviteStudent } from "#controllers/exams/inviteStudents.controller.js";
import { USER_ROLES } from "#utils/constants.util.js";
import { checkAuthorization } from "#middleware/authorization.middleware.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    createExam
  );

router.route("/").get(verifyJWT, getExams);

router
  .route("/question")
  .post(
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    createQuestion
  );

router.route("/question").get(verifyJWT, getQuestions);

router
  .route("/invite")
  .post(
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    inviteStudent
  );

export default router;
