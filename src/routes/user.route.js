import { Router } from "express";
import multer from "multer";

import { changePassword } from "#controllers/users/changePassword.controller.js";
import { deregisterUser } from "#controllers/users/deregisterUser.controller.js";
import { forgotPassword } from "#controllers/users/forgotPassword.controller.js";
import { getCaptcha } from "#controllers/users/getCaptcha.controller.js";
import { getUsers } from "#controllers/users/getUsers.controller.js";
import { inviteUser } from "#controllers/users/inviteUser.controller.js";
import { loginUser } from "#controllers/users/loginUser.controller.js";
import { registerUser } from "#controllers/users/registerUser.controller.js";
import { renewLogin } from "#controllers/users/renewLogin.controller.js";
import { resetPassword } from "#controllers/users/resetPassword.controller.js";
import { updateUser } from "#controllers/users/updateUser.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";
import { checkAuthorization } from "#middleware/authorization.middleware.js";
import { validate } from "#middleware/validation.middleware.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";
import {
  loginUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  renewLoginSchema,
  inviteUserSchema,
  registerUserSchema,
  deregisterUserSchema,
  getUsersSchema,
  changePasswordSchema,
  updateUserSchema,
} from "#validations/user.validation.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route("/login").post(validate(loginUserSchema), verifyJWT, loginUser);

router.route("/captcha").get(getCaptcha);

router
  .route("/password/forgot")
  .post(validate(forgotPasswordSchema), forgotPassword);

router
  .route("/password/reset")
  .post(validate(resetPasswordSchema), verifyJWT, resetPassword);

router
  .route("/password/change")
  .post(validate(changePasswordSchema), verifyJWT, changePassword);

router.route("/renew").post(validate(renewLoginSchema), verifyJWT, renewLogin);

router
  .route("/invite")
  .post(
    validate(inviteUserSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    inviteUser
  );

router
  .route("/register")
  .post(validate(registerUserSchema), verifyJWT, registerUser);

router
  .route("/deregister")
  .patch(validate(deregisterUserSchema), verifyJWT, deregisterUser);

router
  .route("/")
  .get(
    validate(getUsersSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getUsers
  );

router
  .route("/")
  .patch(
    upload.single("profile_picture"),
    validate(updateUserSchema),
    verifyJWT,
    updateUser
  );

export default router;
