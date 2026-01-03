import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import Question from "#models/question.model.js";
import Result from "#models/result.model.js";
import Submission from "#models/submission.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";

export const deleteExam = ApiHandler(async (req, res) => {
  const { id } = req.params;

  // Find exam
  const exam = await Exam.findByPk(id);

  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Check authorization - ADMIN can only delete exams from their entity
  if (
    req.user.role === USER_ROLES.ADMIN &&
    exam.entity_id !== req.user.entity_id
  ) {
    throw new ApiError(403, "FORBIDDEN", "You don't have access to this exam");
  }

  // Delete related data in the correct order (respecting foreign key constraints)
  // 1. Delete submissions
  await Submission.destroy({
    where: { exam_id: id },
  });

  // 2. Delete results
  await Result.destroy({
    where: { exam_id: id },
  });

  // 3. Delete enrollments
  await Enrollment.destroy({
    where: { exam_id: id },
  });

  // 4. Delete questions
  await Question.destroy({
    where: { exam_id: id },
  });

  // 5. Delete exam
  await exam.destroy();

  return res.status(200).json(
    new ApiResponse("EXAM_DELETED", {
      id: id,
    })
  );
});
