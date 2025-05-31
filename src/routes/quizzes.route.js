import { Router } from "express";
import {
  createQuizze,
  coursesQuizzes,
} from "../controllers/quizzes.controller.js";

const router = Router();
router.route("/quizze").post(createQuizze);
router.route("/quizzes").get(coursesQuizzes);

export default router;
