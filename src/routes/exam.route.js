import { Router } from "express";

import { createExam } from "#controllers/exams/createExam.controller.js";
import { createQuestion } from "#controllers/exams/createQuestion.controller.js";
import { deleteQuestion } from "#controllers/exams/deleteQuestion.controller.js";
import { getExams } from "#controllers/exams/getExams.controller.js";
import { getQuestions } from "#controllers/exams/getQuestions.controller.js";
import { inviteStudent } from "#controllers/exams/inviteStudents.controller.js";
import { updateExam } from "#controllers/exams/updateExam.controller.js";
import { updateQuestion } from "#controllers/exams/updateQuestion.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";
import { checkAuthorization } from "#middleware/authorization.middleware.js";
import { validate } from "#middleware/validation.middleware.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";
import {
  createExamSchema,
  updateExamSchema,
  getExamsSchema,
  createQuestionSchema,
  updateQuestionSchema,
  deleteQuestionSchema,
  getQuestionsSchema,
  inviteStudentSchema,
} from "#validations/exam.validation.js";

const router = Router();

router
  .route("/")
  .post(
    validate(createExamSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    createExam
  );

router.route("/").get(validate(getExamsSchema), verifyJWT, getExams);

router
  .route("/:id")
  .patch(
    validate(updateExamSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    updateExam
  );

router
  .route("/question")
  .post(
    validate(createQuestionSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    createQuestion
  );

router
  .route("/question")
  .get(validate(getQuestionsSchema), verifyJWT, getQuestions);

router
  .route("/question/:id")
  .patch(
    validate(updateQuestionSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    updateQuestion
  )
  .delete(
    validate(deleteQuestionSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    deleteQuestion
  );

router
  .route("/invite")
  .post(
    validate(inviteStudentSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    inviteStudent
  );

export default router;
