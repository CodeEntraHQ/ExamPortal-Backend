import { calculateResult } from "#controllers/results/calculateResult.controller.js";
import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import Submission from "#models/submission.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const submitExam = ApiHandler(async (req, res) => {
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
    throw new ApiError(400, "BAD_REQUEST", "Exam has already been submitted");
  }

  // Get all submissions for this exam
  const submissions = await Submission.findAll({
    where: {
      exam_id,
      user_id: req.user.id,
    },
  });

  // Calculate time taken
  const startedAt = enrollment.metadata?.started_at
    ? new Date(enrollment.metadata.started_at)
    : new Date();
  const submittedAt = new Date();
  const timeTaken = Math.floor((submittedAt - startedAt) / 1000); // in seconds

  // Update enrollment status to COMPLETED
  await enrollment.update({
    status: ENROLLMENT_STATUS.COMPLETED,
    metadata: {
      started_at: enrollment.metadata?.started_at || startedAt.toISOString(),
      submitted_at: submittedAt.toISOString(),
    },
  });

  // Calculate and store result (triggered internally when status changes to COMPLETED)
  try {
    await calculateResult(req.user.id, exam_id);
  } catch (error) {
    console.error("Error calculating result:", error);
    // Don't fail the submission if result calculation fails
  }

  // Send response
  return res.status(200).json(
    new ApiResponse("EXAM_SUBMITTED", {
      exam_id: exam.id,
      enrollment_id: enrollment.id,
      status: enrollment.status,
      submitted_at: enrollment.metadata?.submitted_at,
      time_taken: timeTaken,
      total_answers: submissions.length,
    })
  );
});
