import Question from "#models/question.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const createQuestion = ApiHandler(async (req, res) => {
  // Parsing request
  const exam_id = req.body.exam_id?.trim();
  const question_text = req.body.question_text?.trim();
  const type = req.body.type?.trim();
  const metadata = req.body.metadata;

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

  // Create question
  const question = await Question.create({
    exam_id,
    question_text,
    type,
    metadata,
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("QUESTION_CREATED", {
      id: question.id,
    })
  );
});
