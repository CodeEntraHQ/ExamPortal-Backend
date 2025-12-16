import Enrollment from "#models/enrollment.model.js";
import Submission from "#models/submission.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getSubmissions = ApiHandler(async (req, res) => {
  const { exam_id } = req.query;

  // Validate exam_id
  if (!exam_id) {
    throw new ApiError(400, "BAD_REQUEST", "exam_id is required");
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

  // Get all submissions for this exam
  const submissions = await Submission.findAll({
    where: {
      exam_id,
      user_id: req.user.id,
    },
    attributes: ["id", "question_id", "metadata", "last_updated"],
  });

  // Transform submissions to include answers
  const submissionsData = submissions.map((submission) => ({
    question_id: submission.question_id,
    answer: submission.metadata?.answer,
    last_updated: submission.last_updated,
  }));

  // Send response
  return res.status(200).json(
    new ApiResponse("SUBMISSIONS_FETCHED", {
      exam_id,
      enrollment_id: enrollment.id, // Include enrollment_id for monitoring
      enrollment_status: enrollment.status,
      started_at: enrollment.metadata?.started_at,
      submissions: submissionsData,
    })
  );
});
