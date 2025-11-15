import { Router } from "express";

import { inviteStudents } from "#controllers/exams/invite.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";
import { validate } from "#middleware/validation.middleware.js";
import { asyncHandler } from "#utils/api-handler/async.js";
import { examInviteValidation } from "#validations/exam.invite.validation.js";

const router = Router();

router.post(
  "/invite",
  verifyJWT,
  validate(examInviteValidation),
  asyncHandler(inviteStudents)
);

export default router;
