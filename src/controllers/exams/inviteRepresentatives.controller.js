import Enrollment from "#models/enrollment.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import {
  ENROLLMENT_STATUS,
  USER_STATUS,
} from "#utils/constants/model.constant.js";

export const inviteRepresentatives = ApiHandler(async (req, res) => {
  const { exam_id } = req.params;
  const { user_ids } = req.body;

  if (!exam_id || !user_ids || !user_ids.length) {
    throw new ApiError(400, "BAD_REQUEST", "Missing required fields");
  }

  // Find all users by user IDs who are active representatives
  // Representatives don't belong to any entity (entity_id is null)
  const users = await User.findAll({
    where: {
      id: user_ids,
      entity_id: null,
      status: USER_STATUS.ACTIVE,
      role: "REPRESENTATIVE",
    },
  });

  // Check if any users were found
  if (!users.length) {
    throw new ApiError(
      404,
      "NOT_FOUND",
      "No valid representatives found with the provided user IDs"
    );
  }

  // Check if all requested user IDs were found
  if (users.length < user_ids.length) {
    const foundIds = new Set(users.map((u) => u.id));
    const missingIds = user_ids.filter((id) => !foundIds.has(id));
    throw new ApiError(
      404,
      "NOT_FOUND",
      `Some representatives were not found: ${missingIds.join(", ")}`
    );
  }

  // Check for existing enrollments to avoid duplicates
  const existingEnrollments = await Enrollment.findAll({
    where: {
      exam_id: exam_id,
      user_id: users.map((u) => u.id),
    },
  });

  const existingUserIds = new Set(existingEnrollments.map((e) => e.user_id));

  // Filter out users who already have enrollments
  const usersToEnroll = users.filter((user) => !existingUserIds.has(user.id));

  if (!usersToEnroll.length) {
    throw new ApiError(
      409,
      "CONFLICT",
      "All provided representatives are already enrolled in this exam"
    );
  }

  // Create enrollments for all valid users with ASSIGNED status
  const enrollments = await Enrollment.bulkCreate(
    usersToEnroll.map((user) => ({
      exam_id: exam_id,
      user_id: user.id,
      status: ENROLLMENT_STATUS.ASSIGNED,
      metadata: {
        invited_by: req.user.id,
        invited_at: new Date(),
      },
    }))
  );

  // Note: Email invitations can be added here in the future if needed
  // For now, enrollments are created successfully without email notifications

  // Return structured API response
  return res.status(200).json(
    new ApiResponse("REPRESENTATIVES_INVITED", {
      enrollments: enrollments.map((e) => ({
        id: e.id,
        exam_id: e.exam_id,
        user_id: e.user_id,
        status: e.status,
        created_at: e.created_at,
      })),
      enrolledCount: enrollments.length,
    })
  );
});
