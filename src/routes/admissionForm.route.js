import { Router } from "express";

import { createAdmissionForm } from "#controllers/admissionForms/createAdmissionForm.controller.js";
import { getAdmissionForm } from "#controllers/admissionForms/getAdmissionForm.controller.js";
import { updateAdmissionForm } from "#controllers/admissionForms/updateAdmissionForm.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";
import { checkAuthorization } from "#middleware/authorization.middleware.js";
import { validate } from "#middleware/validation.middleware.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";
import {
  createAdmissionFormSchema,
  getAdmissionFormSchema,
  updateAdmissionFormSchema,
} from "#validations/admissionForm.validation.js";

const router = Router();

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
