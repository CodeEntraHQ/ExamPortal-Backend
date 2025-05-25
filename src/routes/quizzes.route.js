import { Router } from "express";
import { coursesQuizzes } from "../controllers/quizzes.controller.js";

const router = Router();

router.route("/quizzes").get(coursesQuizzes);

export default router;
