import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const startExam = ApiHandler(async (req, res) => {
  const { exam_id } = req.body;

  // Validate exam_id
  if (!exam_id) {
    throw new ApiError(400, "BAD_REQUEST", "exam_id is required");
  }

  // Find exam
  const exam = await Exam.findByPk(exam_id);
  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Check if exam is active
  if (!exam.active) {
    throw new ApiError(400, "BAD_REQUEST", "Exam is not active");
  }

  // Find enrollment
  const enrollment = await Enrollment.findOne({
    where: {
      exam_id,
      user_id: req.user.id,
    },
  });

  if (!enrollment) {
    throw new ApiError(403, "FORBIDDEN", "You are not enrolled in this exam");
  }

  // Check if already completed
  if (enrollment.status === ENROLLMENT_STATUS.COMPLETED) {
    throw new ApiError(400, "BAD_REQUEST", "Exam has already been completed");
  }

  // Update enrollment status to ONGOING
  const startedAt = new Date();
  await enrollment.update({
    status: ENROLLMENT_STATUS.ONGOING,
    metadata: {
      started_at: startedAt.toISOString(),
    },
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("EXAM_STARTED", {
      exam_id: exam.id,
      enrollment_id: enrollment.id,
      status: enrollment.status,
      started_at: enrollment.metadata?.started_at,
    })
  );
});
