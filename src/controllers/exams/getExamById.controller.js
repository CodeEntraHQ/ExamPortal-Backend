import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const getExamById = ApiHandler(async (req, res) => {
  const { id } = req.params;

  // Find exam
  const exam = await Exam.findByPk(id);

  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Check if student is enrolled (for STUDENT role)
  if (req.user.role === "STUDENT") {
    const enrollment = await Enrollment.findOne({
      where: {
        exam_id: id,
        user_id: req.user.id,
      },
    });

    if (!enrollment) {
      throw new ApiError(403, "FORBIDDEN", "You are not enrolled in this exam");
    }
  }

  // Check if admin has access (entity check)
  if (req.user.role === "ADMIN" && exam.entity_id !== req.user.entity_id) {
    throw new ApiError(403, "FORBIDDEN", "You don't have access to this exam");
  }

  // Check if representative has access (entity check and enrollment)
  if (req.user.role === "REPRESENTATIVE") {
    // First check entity match
    if (exam.entity_id !== req.user.entity_id) {
      throw new ApiError(
        403,
        "FORBIDDEN",
        "You don't have access to this exam"
      );
    }

    // Then check enrollment
    const enrollment = await Enrollment.findOne({
      where: {
        exam_id: id,
        user_id: req.user.id,
        status: ENROLLMENT_STATUS.ASSIGNED,
      },
    });

    if (!enrollment) {
      throw new ApiError(403, "FORBIDDEN", "You are not enrolled in this exam");
    }
  }

  // Sanitize exam data
  const examData = {
    id: exam.id,
    title: exam.title,
    type: exam.type,
    active: exam.active,
    created_at: exam.created_at,
    duration_seconds: exam.duration_seconds,
    metadata: exam.metadata || null,
    entity_id: exam.entity_id,
    results_visible: exam.results_visible ?? false,
  };

  // Send response
  return res.status(200).json(new ApiResponse("EXAM_FETCHED", examData));
});
