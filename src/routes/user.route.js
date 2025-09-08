import { Router } from "express";
import { verifyJWT } from "#middleware/auth.middleware.js";
import { getAllAdmins, getAllStudents } from "#controllers/user.controller.js";
import { registerUser } from "#controllers/users/registerUser.controller.js";
import { loginUser } from "#controllers/users/loginUser.controller.js";
import { inviteUser } from "#controllers/users/inviteUsers.controller.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/invite").post(verifyJWT, inviteUser);
router.route("/register").post(registerUser);

router.route("/").get(verifyJWT, getAllAdmins);
router.route("/students").get(verifyJWT, getAllStudents);

export default router;
