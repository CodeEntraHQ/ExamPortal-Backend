import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import Result from "#models/result.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import {
  ENROLLMENT_STATUS,
  USER_ROLES,
} from "#utils/constants/model.constant.js";

export const getExamEnrollments = ApiHandler(async (req, res) => {
  const { id } = req.params;

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

  const enrollments = await Enrollment.findAll({
    where: { exam_id: id },
    order: [["created_at", "DESC"]],
  });

  if (!enrollments.length) {
    return res.status(200).json(
      new ApiResponse("EXAM_ENROLLMENTS_FETCHED", {
        exam_id: id,
        enrollments: [],
      })
    );
  }

  const userIds = [
    ...new Set(enrollments.map((enrollment) => enrollment.user_id)),
  ];
  const [users, results] = await Promise.all([
    User.findAll({
      where: { id: userIds },
      attributes: ["id", "name", "email", "roll_number"],
    }),
    Result.findAll({
      where: { exam_id: id },
      attributes: ["user_id", "score", "metadata"],
    }),
  ]);

  const userMap = new Map(users.map((user) => [user.id, user]));
  const resultMap = new Map(results.map((result) => [result.user_id, result]));

  const enrollmentPayload = enrollments.map((enrollment) => {
    const user = userMap.get(enrollment.user_id);
    const result = resultMap.get(enrollment.user_id);

    return {
      id: enrollment.id,
      user_id: enrollment.user_id,
      email: user?.email || null,
      name: user?.name || user?.email || "Unknown Student",
      roll_number: user?.roll_number || null,
      status: enrollment.status || ENROLLMENT_STATUS.UPCOMING,
      enrolled_at: enrollment.created_at,
      score: result?.score ?? null,
      metadata: enrollment.metadata || null,
    };
  });

  return res.status(200).json(
    new ApiResponse("EXAM_ENROLLMENTS_FETCHED", {
      exam_id: id,
      enrollments: enrollmentPayload,
    })
  );
});
