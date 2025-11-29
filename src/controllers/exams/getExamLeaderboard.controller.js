import { Op } from "sequelize";

import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import Result from "#models/result.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const getExamLeaderboard = ApiHandler(async (req, res) => {
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

  // Fetch all completed enrollments for this exam
  const completedEnrollments = await Enrollment.findAll({
    where: {
      exam_id: id,
      status: ENROLLMENT_STATUS.COMPLETED,
    },
    attributes: ["id", "user_id"],
  });

  if (completedEnrollments.length === 0) {
    return res.status(200).json(
      new ApiResponse("LEADERBOARD_FETCHED", {
        leaderboard: [],
      })
    );
  }

  const userIds = completedEnrollments.map((enrollment) => enrollment.user_id);

  // Fetch results for these users and exam
  const results = await Result.findAll({
    where: {
      exam_id: id,
      user_id: { [Op.in]: userIds },
    },
    attributes: ["id", "user_id", "score", "metadata", "created_at"],
  });

  // Fetch user details (email)
  const users = await User.findAll({
    where: {
      id: { [Op.in]: userIds },
    },
    attributes: ["id", "email", "name"],
  });

  // Get passing marks from exam metadata
  const passingMarks = exam.metadata?.passingMarks || 0;

  // Create maps for quick lookup
  const resultsMap = new Map(results.map((r) => [r.user_id, r]));
  const usersMap = new Map(users.map((u) => [u.id, u]));

  // Build leaderboard
  const leaderboard = completedEnrollments
    .map((enrollment) => {
      const result = resultsMap.get(enrollment.user_id);
      const user = usersMap.get(enrollment.user_id);

      if (!result || !user) {
        return null;
      }

      const correctAnswers = result.metadata?.correct_answer || 0;
      const score =
        result.score !== null && result.score !== undefined ? result.score : 0;
      const passed = score >= passingMarks;

      return {
        userId: user.id,
        email: user.email,
        name: user.name || user.email,
        correctAnswers: correctAnswers,
        score: score,
        passed: passed,
        completedAt: result.created_at,
      };
    })
    .filter((item) => item !== null)
    .sort((a, b) => b.score - a.score); // Sort by score descending

  // Send response
  return res.status(200).json(
    new ApiResponse("LEADERBOARD_FETCHED", {
      leaderboard: leaderboard,
    })
  );
});
