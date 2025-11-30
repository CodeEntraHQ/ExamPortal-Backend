import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import Question from "#models/question.model.js";
import Submission from "#models/submission.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { QUESTION_TYPE } from "#utils/constants/model.constant.js";
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

  // Find question to validate answer format
  const question = await Question.findByPk(question_id);
  if (!question) {
    throw new ApiError(404, "NOT_FOUND", "Question not found");
  }

  // Validate answer format based on question type
  if (answer !== null && answer !== undefined) {
    if (question.type === QUESTION_TYPE.MCQ_SINGLE) {
      // MCQ_SINGLE: Answer should be a number (index) or string (option text)
      if (typeof answer !== "number" && typeof answer !== "string") {
        throw new ApiError(
          400,
          "BAD_REQUEST",
          "Answer for MCQ_SINGLE must be a number (index) or string (option text)"
        );
      }
      // Reject empty strings
      if (typeof answer === "string" && answer.trim().length === 0) {
        throw new ApiError(
          400,
          "BAD_REQUEST",
          "Answer for MCQ_SINGLE cannot be empty. Use DELETE endpoint to remove answer."
        );
      }
      // If it's a number, validate it's within range
      if (typeof answer === "number") {
        const options = question.metadata?.options || [];
        if (answer < 0 || answer >= options.length) {
          throw new ApiError(
            400,
            "BAD_REQUEST",
            "Answer index is out of range"
          );
        }
      }
    } else if (question.type === QUESTION_TYPE.MCQ_MULTIPLE) {
      // MCQ_MULTIPLE: Answer should be an array of numbers (indices) or strings (option texts)
      if (!Array.isArray(answer)) {
        throw new ApiError(
          400,
          "BAD_REQUEST",
          "Answer for MCQ_MULTIPLE must be an array"
        );
      }
      if (answer.length === 0) {
        throw new ApiError(
          400,
          "BAD_REQUEST",
          "Answer for MCQ_MULTIPLE must contain at least one option"
        );
      }
      // Validate all indices are within range if they are numbers
      const options = question.metadata?.options || [];
      answer.forEach((ans) => {
        if (typeof ans === "number" && (ans < 0 || ans >= options.length)) {
          throw new ApiError(
            400,
            "BAD_REQUEST",
            "One or more answer indices are out of range"
          );
        }
      });
    } else if (question.type === QUESTION_TYPE.SINGLE_WORD) {
      // SINGLE_WORD: Answer should be a string
      if (typeof answer !== "string") {
        throw new ApiError(
          400,
          "BAD_REQUEST",
          "Answer for SINGLE_WORD must be a string"
        );
      }
      if (answer.trim().length === 0) {
        throw new ApiError(
          400,
          "BAD_REQUEST",
          "Answer for SINGLE_WORD cannot be empty"
        );
      }
    }
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
