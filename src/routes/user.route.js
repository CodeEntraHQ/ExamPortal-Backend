import { Router } from "express";
import { verifyJWT } from "#middleware/auth.middleware.js";
import { registerUser } from "#controllers/users/registerUser.controller.js";
import { loginUser } from "#controllers/users/loginUser.controller.js";
import { inviteUser } from "#controllers/users/inviteUser.controller.js";
import { getUsers } from "#controllers/users/getUsers.controller.js";
import { deregisterUser } from "#controllers/users/deregisterUser.controller.js";
import { renewLogin } from "#controllers/users/renewLogin.controller.js";
import { forgotPassword } from "#controllers/users/forgotPassword.controller.js";
import { resetPassword } from "#controllers/users/resetPassword.controller.js";
import { USER_ROLES } from "#utils/constants.util.js";
import { checkAuthorization } from "#middleware/authorization.middleware.js";

const router = Router();

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset").post(verifyJWT, resetPassword);

router.route("/renew").post(verifyJWT, renewLogin);

router
  .route("/invite")
  .post(
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    inviteUser
  );

router.route("/register").post(verifyJWT, registerUser);

router.route("/deregister").patch(verifyJWT, deregisterUser);

router
  .route("/")
  .get(
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getUsers
  );

export default router;
