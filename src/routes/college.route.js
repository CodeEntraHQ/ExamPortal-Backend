import { Router } from "express";
import { verifyJWT } from "#middleware/authentication.middleware.js";
import { createCollege } from "#controllers/colleges/createCollege.controller.js";
import { updateCollege } from "#controllers/colleges/updateCollege.controller.js";
import { getColleges } from "#controllers/colleges/getColleges.controller.js";
import { USER_ROLES } from "#utils/constants.util.js";
import { checkAuthorization } from "#middleware/authorization.middleware.js";

const router = Router();

router
  .route("/")
  .get(verifyJWT, checkAuthorization(USER_ROLES.SUPERADMIN), getColleges);

router
  .route("/")
  .post(verifyJWT, checkAuthorization(USER_ROLES.SUPERADMIN), createCollege);

router
  .route("/")
  .patch(verifyJWT, checkAuthorization(USER_ROLES.SUPERADMIN), updateCollege);

export default router;
