import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const getExamStatistics = ApiHandler(async (req, res) => {
  const entity_id = req.query.entity_id;

  // Request assertion
  if (
    (req.user.role === "SUPERADMIN" && !entity_id) ||
    (req.user.role !== "SUPERADMIN" && entity_id)
  ) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "entity_id is required for SUPERADMIN"
    );
  }

  // Determine entity_id based on user role
  let targetEntityId = entity_id;
  if (req.user.role === "ADMIN") {
    targetEntityId = req.user.entity_id;
  }

  // Fetch all exams for the entity
  const exams = await Exam.findAll({
    where: { entity_id: targetEntityId },
    attributes: ["id", "active"],
  });

  if (exams.length === 0) {
    return res.status(200).json(
      new ApiResponse("STATISTICS_FETCHED", {
        totalExams: 0,
        activeExams: 0,
        totalStudentsInvited: 0,
        averageCompletion: 0,
      })
    );
  }

  const examIds = exams.map((exam) => exam.id);

  // Fetch all enrollments for these exams
  const enrollments = await Enrollment.findAll({
    where: { exam_id: examIds },
    attributes: ["exam_id", "status", "user_id"],
  });

  // Calculate statistics
  const totalExamsCount = exams.length;
  const activeExamsCount = exams.filter((exam) => exam.active).length;
  const totalStudentsInvited = [
    ...new Set(enrollments.map((enrollment) => enrollment.user_id)),
  ].length;

  // Calculate average completion percentage
  // Count unique students who completed at least one exam
  const uniqueCompletedStudents = [
    ...new Set(
      enrollments
        .filter(
          (enrollment) => enrollment.status === ENROLLMENT_STATUS.COMPLETED
        )
        .map((enrollment) => enrollment.user_id)
    ),
  ].length;

  const averageCompletion =
    totalStudentsInvited > 0
      ? Math.round((uniqueCompletedStudents / totalStudentsInvited) * 100)
      : 0;

  // Send response
  return res.status(200).json(
    new ApiResponse("STATISTICS_FETCHED", {
      totalExams: totalExamsCount,
      activeExams: activeExamsCount,
      totalStudentsInvited: totalStudentsInvited,
      averageCompletion: averageCompletion,
    })
  );
});
