import Quiz from "../models/quizzes.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Course from "../models/courses.model.js";
import sequelize from "../db/index.js";

const createQuizze = asyncHandler(async (req, res) => {
  const { title, description, time_limit, course_id } = req.body;
  if (
    [title, description, time_limit, course_id].some(
      (field) => !field || String(field).trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const parsedTimeLimit = parseInt(time_limit, 10);
  if (isNaN(parsedTimeLimit) || parsedTimeLimit <= 0) {
    throw new ApiError(400, "time_limit must be a positive integer");
  }

  const t = await sequelize.transaction();

  try {
    const existedCourse = await Course.findOne({
      where: { id: course_id },
    });

    if (!existedCourse) {
      throw new ApiError(409, "Course with course_id does not exist");
    }

    await Quiz.create({
      title,
      description,
      time_limit: parsedTimeLimit,
      course_id,
    });

    await t.commit();

    return res
      .status(201)
      .json(new ApiResponse(200, {}, "Quiz created successfully"));
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

const coursesQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.findAll();
  return res
    .status(200)
    .json(new ApiResponse(200, quizzes ?? [], "quizzes fetched successfully"));
});

export { createQuizze, coursesQuizzes };
