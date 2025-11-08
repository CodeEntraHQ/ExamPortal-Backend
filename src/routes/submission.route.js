import { Router } from "express";

import { getSubmissions } from "#controllers/submissions/getSubmissions.controller.js";
import { saveAnswer } from "#controllers/submissions/saveAnswer.controller.js";
import { startExam } from "#controllers/submissions/startExam.controller.js";
import { submitExam } from "#controllers/submissions/submitExam.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";
import { checkAuthorization } from "#middleware/authorization.middleware.js";
import { validate } from "#middleware/validation.middleware.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";
import {
  startExamSchema,
  saveAnswerSchema,
  submitExamSchema,
  getSubmissionsSchema,
} from "#validations/submission.validation.js";

const router = Router();

// All submission routes require STUDENT role
router.post(
  "/start",
  validate(startExamSchema),
  verifyJWT,
  checkAuthorization(USER_ROLES.STUDENT),
  startExam
);

router.post(
  "/answer",
  validate(saveAnswerSchema),
  verifyJWT,
  checkAuthorization(USER_ROLES.STUDENT),
  saveAnswer
);

router.post(
  "/submit",
  validate(submitExamSchema),
  verifyJWT,
  checkAuthorization(USER_ROLES.STUDENT),
  submitExam
);

router.get(
  "/",
  validate(getSubmissionsSchema),
  verifyJWT,
  checkAuthorization(USER_ROLES.STUDENT),
  getSubmissions
);

export default router;
