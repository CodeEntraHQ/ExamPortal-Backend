import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import Result from "#models/result.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const getStudentEnrollments = ApiHandler(async (req, res) => {
  // Get all enrollments for the current student
  const enrollments = await Enrollment.findAll({
    where: { user_id: req.user.id },
    attributes: [
      "id",
      "exam_id",
      "user_id",
      "status",
      "metadata",
      "created_at",
    ],
  });

  if (enrollments.length === 0) {
    return res.status(200).json(
      new ApiResponse("ENROLLMENTS_FETCHED", {
        enrollments: [],
      })
    );
  }

  const examIds = enrollments.map((e) => e.exam_id);

  if (examIds.length === 0) {
    return res.status(200).json(
      new ApiResponse("ENROLLMENTS_FETCHED", {
        total: 0,
        ongoing: [],
        upcoming: [],
        completed: [],
        all: [],
      })
    );
  }

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

  // Fetch results for these exams and user
  // Note: Result model uses quiz_id, we'll check if it matches exam_id
  const results = await Result.findAll({
    where: {
      user_id: req.user.id,
      exam_id: examIds,
    },
    attributes: ["id", "exam_id", "user_id", "score", "metadata", "created_at"],
  });

  const resultsMap = new Map(results.map((r) => [r.exam_id, r]));

  // Combine enrollment and exam data with computed status
  const enrollmentsWithDetails = enrollments
    .map((enrollment) => {
      const exam = exams.find((e) => e.id === enrollment.exam_id);
      if (!exam) {
        return null;
      }

      const result = resultsMap.get(enrollment.exam_id);

      // Use enrollment status from database
      // Only mark as COMPLETED if enrollment status is actually COMPLETED
      // Don't override based on result existence, as results are initialized on enrollment
      let status = enrollment.status || ENROLLMENT_STATUS.UPCOMING;

      // Only override to COMPLETED if enrollment status is already COMPLETED
      // This ensures that UPCOMING/ONGOING enrollments with initialized results stay in correct status
      if (enrollment.status === ENROLLMENT_STATUS.COMPLETED) {
        status = ENROLLMENT_STATUS.COMPLETED;
      }

      return {
        id: enrollment.id,
        exam_id: enrollment.exam_id,
        user_id: enrollment.user_id,
        status,
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
        result: result
          ? {
              id: result.id,
              score: result.score,
              metadata: result.metadata || null,
              created_at: result.created_at,
            }
          : null,
      };
    })
    .filter(Boolean); // Remove null entries

  // Separate by status
  const ongoing = enrollmentsWithDetails.filter(
    (e) => e.status === ENROLLMENT_STATUS.ONGOING
  );
  const upcoming = enrollmentsWithDetails.filter(
    (e) => e.status === ENROLLMENT_STATUS.UPCOMING
  );
  const completed = enrollmentsWithDetails.filter(
    (e) => e.status === ENROLLMENT_STATUS.COMPLETED
  );

  // Send response
  return res.status(200).json(
    new ApiResponse("ENROLLMENTS_FETCHED", {
      total: enrollmentsWithDetails.length,
      ongoing,
      upcoming,
      completed,
      all: enrollmentsWithDetails,
    })
  );
});
