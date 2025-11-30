import Question from "#models/question.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { QUESTION_TYPE } from "#utils/constants/model.constant.js";

export const createQuestion = ApiHandler(async (req, res) => {
  // Parsing request
  const exam_id = req.body.exam_id?.trim();
  const question_text = req.body.question_text?.trim();
  const type = req.body.type?.trim();
  const metadata = req.body.metadata;

  // Validate question type
  if (!type || !Object.values(QUESTION_TYPE).includes(type)) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      `Question type must be one of: ${Object.values(QUESTION_TYPE).join(", ")}`
    );
  }

  // Validate metadata based on question type
  if (type === QUESTION_TYPE.MCQ_SINGLE) {
    if (
      !metadata?.options ||
      !Array.isArray(metadata.options) ||
      metadata.options.length < 2
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_SINGLE questions must have at least 2 options"
      );
    }
    if (
      !Array.isArray(metadata.correct_answers) ||
      metadata.correct_answers.length !== 1
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_SINGLE questions must have exactly one correct answer index"
      );
    }
    // Validate that the correct answer index is valid
    if (
      metadata.correct_answers[0] < 0 ||
      metadata.correct_answers[0] >= metadata.options.length
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Correct answer index is out of range"
      );
    }
  } else if (type === QUESTION_TYPE.MCQ_MULTIPLE) {
    if (
      !metadata?.options ||
      !Array.isArray(metadata.options) ||
      metadata.options.length < 2
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_MULTIPLE questions must have at least 2 options"
      );
    }
    if (
      !Array.isArray(metadata.correct_answers) ||
      metadata.correct_answers.length < 1
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_MULTIPLE questions must have at least one correct answer index"
      );
    }
    // Validate that all correct answer indices are valid
    const invalidIndices = metadata.correct_answers.filter(
      (index) => index < 0 || index >= metadata.options.length
    );
    if (invalidIndices.length > 0) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "One or more correct answer indices are out of range"
      );
    }
  } else if (type === QUESTION_TYPE.SINGLE_WORD) {
    if (
      !metadata?.correct_answer ||
      typeof metadata.correct_answer !== "string" ||
      metadata.correct_answer.trim().length === 0
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "SINGLE_WORD questions must have a correct_answer string"
      );
    }
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
