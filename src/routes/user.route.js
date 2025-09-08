import { Router } from "express";
import { verifyJWT } from "#middleware/auth.middleware.js";
import {
  onboardUsers,
  loginUser,
  getAllAdmins,
  getAllStudents,
} from "#controllers/user.controller.js";
import { registerStudent } from "#controllers/users/registerStudent.controller.js";

const router = Router();

router.route("/register").post(registerStudent);
router.route("/").post(verifyJWT, onboardUsers);
router.route("/login").post(loginUser);
router.route("/").get(verifyJWT, getAllAdmins);
router.route("/students").get(verifyJWT, getAllStudents);
export default router;
