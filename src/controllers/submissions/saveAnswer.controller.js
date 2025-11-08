import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import Submission from "#models/submission.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const saveAnswer = ApiHandler(async (req, res) => {
  const { exam_id, question_id, answer } = req.body;

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

  // Check if exam is ongoing or can be started
  if (enrollment.status === ENROLLMENT_STATUS.COMPLETED) {
    throw new ApiError(400, "BAD_REQUEST", "Exam has already been completed");
  }

  // If not started yet, start it
  if (enrollment.status !== ENROLLMENT_STATUS.ONGOING) {
    const startedAt = new Date();
    await enrollment.update({
      status: ENROLLMENT_STATUS.ONGOING,
      metadata: {
        started_at: startedAt.toISOString(),
      },
    });
  }

  // Find or create submission
  const now = new Date();
  const [submission, created] = await Submission.findOrCreate({
    where: {
      user_id: req.user.id,
      exam_id,
      question_id,
    },
    defaults: {
      user_id: req.user.id,
      exam_id,
      question_id,
      metadata: {
        answer: answer,
      },
      last_updated: now,
    },
  });

  // Update if already exists
  if (!created) {
    await submission.update({
      metadata: {
        ...(submission.metadata || {}),
        answer: answer,
      },
      last_updated: now,
    });
  }

  // Send response
  return res.status(200).json(
    new ApiResponse("ANSWER_SAVED", {
      submission_id: submission.id,
      exam_id,
      question_id,
      saved_at: submission.last_updated,
    })
  );
});
