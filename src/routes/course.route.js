import { Router } from "express";
import { usersCourses } from "../controllers/course.controller.js";

const router = Router();

router.route("/courses").get(usersCourses);

export default router;
