import { Router } from "express";

import { createCollege } from "#controllers/colleges/createCollege.controller.js";
import { getColleges } from "#controllers/colleges/getColleges.controller.js";
import { updateCollege } from "#controllers/colleges/updateCollege.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";
import { checkAuthorization } from "#middleware/authorization.middleware.js";
import { validate } from "#middleware/validation.middleware.js";
import { USER_ROLES } from "#utils/constants.util.js";
import {
  getCollegesSchema,
  createCollegeSchema,
} from "#validations/college.validation.js";

const router = Router();

router
  .route("/")
  .get(
    validate(getCollegesSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN),
    getColleges
  );

router
  .route("/")
  .post(
    validate(createCollegeSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN),
    createCollege
  );

router
  .route("/")
  .patch(verifyJWT, checkAuthorization(USER_ROLES.SUPERADMIN), updateCollege);

export default router;
