import { Router } from "express";
import {
  createQuizze,
  deleteQuizze,
  getQuizze,
  updateQuizze,
  coursesQuizzes
} from "../controllers/quizzes.controller.js";



const router = Router();
router.route("/quizze").post(createQuizze);
router.route("/quizze/:queizz_id").get(getQuizze);
router.route("/delete/:queizz_id").delete(deleteQuizze);
router.route("/update/:queizz_id").put(updateQuizze);
router.route("/quizzes").get(coursesQuizzes);


export default router;
