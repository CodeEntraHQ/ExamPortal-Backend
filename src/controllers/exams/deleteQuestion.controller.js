import Question from "#models/question.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const deleteQuestion = ApiHandler(async (req, res) => {
  // Parsing request
  const question_id = req.params.id?.trim();

  // Validate question_id
  if (!question_id) {
    throw new ApiError(400, "BAD_REQUEST", "question_id is required");
  }

  // Find question
  const question = await Question.findByPk(question_id);

  if (!question) {
    throw new ApiError(404, "QUESTION_NOT_FOUND", "Question not found");
  }

  // Delete question
  await question.destroy();

  // Send response
  return res.status(200).json(
    new ApiResponse("QUESTION_DELETED", {
      id: question_id,
    })
  );
});
