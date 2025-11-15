import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const getExamDetailStatistics = ApiHandler(async (req, res) => {
  const { id } = req.params;

  // Find exam
  const exam = await Exam.findByPk(id);

  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Check if admin/superadmin has access (entity check)
  if (req.user.role === "ADMIN" && exam.entity_id !== req.user.entity_id) {
    throw new ApiError(403, "FORBIDDEN", "You don't have access to this exam");
  }

  // Fetch all enrollments for this exam
  const enrollments = await Enrollment.findAll({
    where: { exam_id: id },
    attributes: ["id", "user_id", "status"],
  });

  // Calculate statistics
  const totalStudentsInvited = [
    ...new Set(enrollments.map((enrollment) => enrollment.user_id)),
  ].length;

  // Count completed enrollments
  const completedEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === ENROLLMENT_STATUS.COMPLETED
  ).length;

  // Calculate completion rate
  const completionRate =
    totalStudentsInvited > 0
      ? Math.round((completedEnrollments / totalStudentsInvited) * 100)
      : 0;

  // Send response
  return res.status(200).json(
    new ApiResponse("STATISTICS_FETCHED", {
      totalAttempts: completedEnrollments,
      totalStudentsInvited: totalStudentsInvited,
      completionRate: completionRate,
    })
  );
});
