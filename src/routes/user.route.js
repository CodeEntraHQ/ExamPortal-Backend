import { Router } from "express";
import multer from "multer";

import { activateUser } from "#controllers/users/activateUser.controller.js";
import { changePassword } from "#controllers/users/changePassword.controller.js";
import { createUser } from "#controllers/users/createUser.controller.js";
import { deregisterUser } from "#controllers/users/deregisterUser.controller.js";
import { forgotPassword } from "#controllers/users/forgotPassword.controller.js";
import { generateTwoFa } from "#controllers/users/generateTwoFa.controller.js";
import { getUsers } from "#controllers/users/getUsers.controller.js";
import { inviteUser } from "#controllers/users/inviteUser.controller.js";
import { loginUser } from "#controllers/users/loginUser.controller.js";
import { registerUser } from "#controllers/users/registerUser.controller.js";
import { renewLogin } from "#controllers/users/renewLogin.controller.js";
import { resetPassword } from "#controllers/users/resetPassword.controller.js";
import { toggleTwoFa } from "#controllers/users/toggleTwoFa.controller.js";
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
  activateUserSchema,
  createUserSchema,
  getUsersSchema,
  changePasswordSchema,
  updateUserSchema,
  toggleTwoFaSchema,
  generateTwoFaSchema,
} from "#validations/user.validation.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route("/login").post(validate(loginUserSchema), loginUser);

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
  .route("/create")
  .post(
    validate(createUserSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    createUser
  );

router
  .route("/register")
  .post(
    upload.single("profile_picture"),
    validate(registerUserSchema),
    verifyJWT,
    registerUser
  );

router
  .route("/deregister")
  .patch(validate(deregisterUserSchema), verifyJWT, deregisterUser);

router
  .route("/activate")
  .patch(
    validate(activateUserSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    activateUser
  );

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

router
  .route("/two-fa/generate")
  .get(validate(generateTwoFaSchema), verifyJWT, generateTwoFa);

router
  .route("/two-fa/toggle")
  .patch(validate(toggleTwoFaSchema), verifyJWT, toggleTwoFa);

export default router;
