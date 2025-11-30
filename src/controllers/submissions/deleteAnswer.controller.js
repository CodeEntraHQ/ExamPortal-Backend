import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import Submission from "#models/submission.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const deleteAnswer = ApiHandler(async (req, res) => {
  const { exam_id, question_id } = req.body;

  // Validate required fields
  if (!exam_id || !question_id) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "exam_id and question_id are required"
    );
  }

  // Find exam
  const exam = await Exam.findByPk(exam_id);
  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Find enrollment and check status
  const enrollment = await Enrollment.findOne({
    where: {
      exam_id,
      user_id: req.user.id,
    },
  });

  if (!enrollment) {
    throw new ApiError(403, "FORBIDDEN", "You are not enrolled in this exam");
  }

  // Check if exam is completed
  if (enrollment.status === ENROLLMENT_STATUS.COMPLETED) {
    throw new ApiError(400, "BAD_REQUEST", "Exam has already been completed");
  }

  // Find and delete submission
  const submission = await Submission.findOne({
    where: {
      user_id: req.user.id,
      exam_id,
      question_id,
    },
  });

  if (submission) {
    await submission.destroy();
  }

  // Send response
  return res.status(200).json(
    new ApiResponse("ANSWER_DELETED", {
      exam_id,
      question_id,
      deleted_at: new Date().toISOString(),
    })
  );
});
