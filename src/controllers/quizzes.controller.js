import Quiz from "../models/quizzes.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const coursesQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.findAll();

  //   console.log("quizzes>>>>>>>", quizzes);
  return res
    .status(200)
    .json(new ApiResponse(200, quizzes ?? [], "quizzes fetched successfully"));
});

export { coursesQuizzes };
