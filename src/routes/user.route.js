import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  onboardUsers,
  loginUser,
  getAllAdmins,
  studentRegistration,
  getAllStudents,
} from "../controllers/user.controller.js";



const router = Router();

router.route("/").post(verifyJWT, onboardUsers);
router.route("/login").post(loginUser);
router.route("/register").post(studentRegistration);
router.route("/").get(verifyJWT, getAllAdmins);
router.route("/students").get(verifyJWT, getAllStudents);
export default router;
