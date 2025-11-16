import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const getRepresentativeEnrollments = ApiHandler(async (req, res) => {
  // Get all enrollments for the current representative with ASSIGNED status
  const enrollments = await Enrollment.findAll({
    where: {
      user_id: req.user.id,
      status: ENROLLMENT_STATUS.ASSIGNED,
    },
    attributes: [
      "id",
      "exam_id",
      "user_id",
      "status",
      "metadata",
      "created_at",
    ],
    order: [["created_at", "DESC"]],
  });

  if (enrollments.length === 0) {
    return res.status(200).json(
      new ApiResponse("ENROLLMENTS_FETCHED", {
        enrollments: [],
      })
    );
  }

  const examIds = enrollments.map((e) => e.exam_id);

  // Fetch exam details for these enrollments
  const exams = await Exam.findAll({
    where: { id: examIds },
    attributes: [
      "id",
      "title",
      "type",
      "active",
      "created_at",
      "duration_seconds",
      "metadata",
      "entity_id",
    ],
  });

  // Combine enrollment and exam data
  const enrollmentsWithDetails = enrollments
    .map((enrollment) => {
      const exam = exams.find((e) => e.id === enrollment.exam_id);
      if (!exam) {
        return null;
      }

      return {
        id: enrollment.id,
        exam_id: enrollment.exam_id,
        user_id: enrollment.user_id,
        status: enrollment.status,
        enrollment_created_at: enrollment.created_at,
        exam: {
          id: exam.id,
          title: exam.title,
          type: exam.type,
          active: exam.active,
          created_at: exam.created_at,
          duration_seconds: exam.duration_seconds,
          metadata: exam.metadata || null,
          entity_id: exam.entity_id,
        },
      };
    })
    .filter(Boolean); // Remove null entries

  return res.status(200).json(
    new ApiResponse("ENROLLMENTS_FETCHED", {
      enrollments: enrollmentsWithDetails,
      total: enrollmentsWithDetails.length,
    })
  );
});
