import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import Result from "#models/result.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";

export const deleteExamEnrollment = ApiHandler(async (req, res) => {
  const { id, enrollmentId } = req.params;

  const exam = await Exam.findByPk(id);

  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  if (
    req.user.role === USER_ROLES.ADMIN &&
    exam.entity_id !== req.user.entity_id
  ) {
    throw new ApiError(403, "FORBIDDEN", "You don't have access to this exam");
  }

  const enrollment = await Enrollment.findOne({
    where: {
      id: enrollmentId,
      exam_id: id,
    },
  });

  if (!enrollment) {
    throw new ApiError(404, "NOT_FOUND", "Enrollment not found for this exam");
  }

  await Result.destroy({
    where: {
      exam_id: id,
      user_id: enrollment.user_id,
    },
  });

  await enrollment.destroy();

  return res.status(200).json(
    new ApiResponse("EXAM_ENROLLMENT_REMOVED", {
      enrollment_id: enrollmentId,
    })
  );
});
