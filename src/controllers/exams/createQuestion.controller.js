import Question from "#models/question.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiHandler } from "#utils/api-handler/handler.js";

export const createQuestion = ApiHandler(async (req, res) => {
  // Parsing request
  const { exam_id, question_text, type, metadata } = req.body;

  // Request assertion
  if (
    [exam_id, question_text, type].some(
      (field) => !field || String(field).trim() === ""
    )
  ) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "exam_id, question_text and type are required"
    );
  }

  // Request assertion
  if (
    type === "MCQ" &&
    (!metadata?.options ||
      !Array.isArray(metadata.options) ||
      metadata.options.length < 2 ||
      !Array.isArray(metadata.correct_answers))
  ) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "MCQ questions must have options and correct_answers"
    );
  }

  const question = await Question.create({
    exam_id,
    question_text,
    type,
    metadata,
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("QUESTION_CREATED", {
      question_id: question.id,
    })
  );
});
