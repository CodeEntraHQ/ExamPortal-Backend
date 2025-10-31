import Question from "#models/question.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getQuestions = ApiHandler(async (req, res) => {
  const exam_id = req.query.exam_id?.trim();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { rows, count: total } = await Question.findAndCountAll({
    where: { exam_id: exam_id },
    offset,
    limit,
    attributes: ["id", "question_text", "type", "metadata", "created_at"],
    order: [["created_at", "ASC"]],
  });

  const questions = rows.map((question) => {
    const { id, question_text, type, metadata, created_at } = question;

    const sanitizedMetadata = { ...metadata };
    if (req.user.role === "STUDENT") {
      delete sanitizedMetadata.correct_answers;
    }

    return {
      id,
      question_text,
      type,
      metadata: sanitizedMetadata,
      created_at,
    };
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("QUESTIONS_FETCHED", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      questions,
    })
  );
});
