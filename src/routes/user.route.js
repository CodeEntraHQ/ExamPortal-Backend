import { Router } from "express";
import { verifyJWT } from "#middleware/auth.middleware.js";
import { registerUser } from "#controllers/users/registerUser.controller.js";
import { loginUser } from "#controllers/users/loginUser.controller.js";
import { inviteUser } from "#controllers/users/inviteUser.controller.js";
import { getUsers } from "#controllers/users/getUsers.controller.js";
import { deregisterUser } from "#controllers/users/deregisterUser.controller.js";
import { renewLogin } from "#controllers/users/renewLogin.controller.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/renew").post(verifyJWT, renewLogin);
router.route("/invite").post(verifyJWT, inviteUser);
router.route("/register").post(verifyJWT, registerUser);
router.route("/deregister").patch(verifyJWT, deregisterUser);
router.route("/").get(verifyJWT, getUsers);

export default router;
