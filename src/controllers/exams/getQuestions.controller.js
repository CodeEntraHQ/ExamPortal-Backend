import Question from "#models/question.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { constructMediaLink } from "#utils/utils.js";

export const getQuestions = ApiHandler(async (req, res) => {
  const exam_id = req.query.exam_id?.trim();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { rows, count: total } = await Question.findAndCountAll({
    where: { exam_id: exam_id },
    offset,
    limit,
    attributes: [
      "id",
      "question_text",
      "question_image_id",
      "type",
      "metadata",
      "created_at",
    ],
    order: [["created_at", "ASC"]],
  });

  const questions = rows.map((question) => {
    const { id, question_text, question_image_id, type, metadata, created_at } =
      question;

    const sanitizedMetadata = { ...metadata };
    if (req.user.role === "STUDENT") {
      // Hide correct answers for students
      delete sanitizedMetadata.correct_answers;
      delete sanitizedMetadata.correct_answer; // For SINGLE_WORD questions
    }

    // Construct image links for options
    if (sanitizedMetadata.options && Array.isArray(sanitizedMetadata.options)) {
      sanitizedMetadata.options = sanitizedMetadata.options.map((option) => {
        if (option.image_id) {
          return {
            ...option,
            image_url: constructMediaLink(option.image_id),
          };
        }
        return option;
      });
    }

    return {
      id,
      question_text,
      question_image_id: question_image_id
        ? constructMediaLink(question_image_id)
        : null,
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
