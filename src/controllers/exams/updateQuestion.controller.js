import Question from "#models/question.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { QUESTION_TYPE } from "#utils/constants/model.constant.js";

export const updateQuestion = ApiHandler(async (req, res) => {
  // Parsing request
  const question_id = req.params.id?.trim();
  const question_text = req.body.question_text?.trim();
  const type = req.body.type?.trim();
  const metadata = req.body.metadata;

  // Validate question_id
  if (!question_id) {
    throw new ApiError(400, "BAD_REQUEST", "question_id is required");
  }

  // Find question
  const question = await Question.findByPk(question_id);

  if (!question) {
    throw new ApiError(404, "QUESTION_NOT_FOUND", "Question not found");
  }

  // Build update data
  const updateData = {};
  if (question_text !== undefined) updateData.question_text = question_text;
  if (type !== undefined) {
    // Validate question type
    if (!Object.values(QUESTION_TYPE).includes(type)) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        `Question type must be one of: ${Object.values(QUESTION_TYPE).join(", ")}`
      );
    }
    updateData.type = type;
  }
  if (metadata !== undefined) updateData.metadata = metadata;

  // Validate required fields
  const updatedQuestionText =
    updateData.question_text || question.question_text;
  const updatedType = updateData.type || question.type;

  if (!updatedQuestionText || !updatedType) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "question_text and type cannot be empty"
    );
  }

  // Validate metadata based on question type (use updated type if provided, otherwise existing type)
  const typeToValidate = updateData.type || question.type;
  const metadataToValidate =
    updateData.metadata !== undefined ? updateData.metadata : question.metadata;

  if (typeToValidate === QUESTION_TYPE.MCQ_SINGLE) {
    if (
      !metadataToValidate?.options ||
      !Array.isArray(metadataToValidate.options) ||
      metadataToValidate.options.length < 2
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_SINGLE questions must have at least 2 options"
      );
    }
    if (
      !Array.isArray(metadataToValidate.correct_answers) ||
      metadataToValidate.correct_answers.length !== 1
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_SINGLE questions must have exactly one correct answer index"
      );
    }
    // Validate that the correct answer index is valid
    if (
      metadataToValidate.correct_answers[0] < 0 ||
      metadataToValidate.correct_answers[0] >= metadataToValidate.options.length
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Correct answer index is out of range"
      );
    }
  } else if (typeToValidate === QUESTION_TYPE.MCQ_MULTIPLE) {
    if (
      !metadataToValidate?.options ||
      !Array.isArray(metadataToValidate.options) ||
      metadataToValidate.options.length < 2
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_MULTIPLE questions must have at least 2 options"
      );
    }
    if (
      !Array.isArray(metadataToValidate.correct_answers) ||
      metadataToValidate.correct_answers.length < 1
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ_MULTIPLE questions must have at least one correct answer index"
      );
    }
    // Validate that all correct answer indices are valid
    const invalidIndices = metadataToValidate.correct_answers.filter(
      (index) => index < 0 || index >= metadataToValidate.options.length
    );
    if (invalidIndices.length > 0) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "One or more correct answer indices are out of range"
      );
    }
  } else if (typeToValidate === QUESTION_TYPE.SINGLE_WORD) {
    if (
      !metadataToValidate?.correct_answer ||
      typeof metadataToValidate.correct_answer !== "string" ||
      metadataToValidate.correct_answer.trim().length === 0
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "SINGLE_WORD questions must have a correct_answer string"
      );
    }
  }

  // Update question
  await question.update(updateData);

  // Refresh question to get updated data
  await question.reload();

  // Send response
  return res.status(200).json(
    new ApiResponse("QUESTION_UPDATED", {
      id: question.id,
      question_text: question.question_text,
      type: question.type,
      metadata: question.metadata,
      created_at: question.created_at,
    })
  );
});
