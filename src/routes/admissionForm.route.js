import { Router } from "express";

import { createAdmissionForm } from "#controllers/admissionForms/createAdmissionForm.controller.js";
import { getAdmissionForm } from "#controllers/admissionForms/getAdmissionForm.controller.js";
import { getAdmissionFormSubmissions } from "#controllers/admissionForms/getAdmissionFormSubmissions.controller.js";
import { getPublicAdmissionForm } from "#controllers/admissionForms/getPublicAdmissionForm.controller.js";
import { getPublicToken } from "#controllers/admissionForms/getPublicToken.controller.js";
import { submitAdmissionForm } from "#controllers/admissionForms/submitAdmissionForm.controller.js";
import { submitPublicAdmissionForm } from "#controllers/admissionForms/submitPublicAdmissionForm.controller.js";
import { updateAdmissionForm } from "#controllers/admissionForms/updateAdmissionForm.controller.js";
import { updateSubmissionStatus } from "#controllers/admissionForms/updateSubmissionStatus.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";
import { checkAuthorization } from "#middleware/authorization.middleware.js";
import { validate } from "#middleware/validation.middleware.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";
import {
  createAdmissionFormSchema,
  getAdmissionFormSchema,
  getAdmissionFormSubmissionsSchema,
  submitAdmissionFormSchema,
  updateAdmissionFormSchema,
  updateSubmissionStatusSchema,
} from "#validations/admissionForm.validation.js";

const router = Router();

// Public routes (no authentication required)
router
  .route("/public/:token")
  .get(getPublicAdmissionForm)
  .post(submitPublicAdmissionForm);

// Specific routes must come before parameterized routes
router
  .route("/submissions")
  .get(
    validate(getAdmissionFormSubmissionsSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getAdmissionFormSubmissions
  );

router
  .route("/submissions/:submission_id/status")
  .patch(
    validate(updateSubmissionStatusSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    updateSubmissionStatus
  );

router
  .route("/:exam_id/submit")
  .post(
    validate(submitAdmissionFormSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.REPRESENTATIVE),
    submitAdmissionForm
  );

router
  .route("/:exam_id/public-token")
  .get(
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getPublicToken
  );

router
  .route("/:exam_id")
  .post(
    validate(createAdmissionFormSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    createAdmissionForm
  )
  .get(
    validate(getAdmissionFormSchema),
    verifyJWT,
    checkAuthorization(
      USER_ROLES.SUPERADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.REPRESENTATIVE
    ),
    getAdmissionForm
  )
  .patch(
    validate(updateAdmissionFormSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    updateAdmissionForm
  );

export default router;
