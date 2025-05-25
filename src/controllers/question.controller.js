import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Question from "../models/question.model.js";
import Option from "../models/option.model.js";
import Quiz from "../models/quizzes.model.js";

const getQuizzQuestion = asyncHandler(async (req, res) => {
  const quiz_id = req.params.Quiz_Id;
  //   console.log("quizze_id>>>>>>>>>>>>", quiz_id);

  if (!quiz_id) {
    throw new ApiError(409, "Please send  Quiz_id");
  }
  //   const Questios = await Question.findAll({ where: { quiz_id } });

  const questions = await Question.findAll({
    where: { quiz_id },
    include: [
      {
        model: Option,
        as: "Options", // use alias only if you’ve defined it in association
      },
    ],
  });

  //   console.log("quizzes>>>>>>>", quizzes);
  return res
    .status(200)
    .json(
      new ApiResponse(200, questions ?? [], "question fetched successfully")
    );
});

export { getQuizzQuestion };
