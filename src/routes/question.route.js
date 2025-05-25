import { Router } from "express";
import { getQuizzQuestion } from "../controllers/question.controller.js";

const router = Router();

router.route("/questions/:Quiz_Id").get(getQuizzQuestion);

export default router;
