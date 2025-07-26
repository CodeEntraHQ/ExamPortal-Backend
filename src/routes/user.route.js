import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { onboardUsers, loginUser, getAllAdmins, studentRegistration } from "../controllers/user.controller.js";

// import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, onboardUsers);
router.route("/login").post(loginUser);
router.route("/register").post(studentRegistration);
router.route("/").get(verifyJWT, getAllAdmins);

export default router;