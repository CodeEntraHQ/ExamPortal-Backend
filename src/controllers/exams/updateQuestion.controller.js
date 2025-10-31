import Question from "#models/question.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

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
  if (type !== undefined) updateData.type = type;
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

  // Validate MCQ questions
  if ((updateData.type === "MCQ" || question.type === "MCQ") && metadata) {
    if (
      !metadata.options ||
      !Array.isArray(metadata.options) ||
      metadata.options.length < 2 ||
      !Array.isArray(metadata.correct_answers)
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "MCQ questions must have options and correct_answers"
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
