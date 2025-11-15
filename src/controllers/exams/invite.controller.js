import Enrollment from "#models/enrollment.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_STATUS } from "#utils/constants/model.constant.js";
import { sendExamInvitationEmail } from "#utils/email-handler/index.js";

export const inviteStudents = async (req, res) => {
  const { examId, emails, entityId } = req.body;

  if (!examId || !emails || !emails.length || !entityId) {
    throw new ApiError(400, "BAD_REQUEST", "Missing required fields");
  }

  // Find all users by email who are active students in the same entity
  const users = await User.findAll({
    where: {
      email: emails,
      entity_id: entityId,
      status: USER_STATUS.ACTIVE,
      role: "STUDENT",
    },
  });

  // Check if any users were found
  if (!users.length) {
    throw new ApiError(
      404,
      "NOT_FOUND",
      "No valid students found with the provided emails"
    );
  }

  // Create enrollments for all valid users
  const enrollments = await Enrollment.bulkCreate(
    users.map((user) => ({
      exam_id: examId,
      user_id: user.id,
      metadata: {
        invited_by: req.user.id,
        invited_at: new Date(),
      },
    }))
  );

  // Send invitation emails to all enrolled students
  try {
    await Promise.all(
      users.map((user) =>
        sendExamInvitationEmail({
          to: user.email,
          examId,
          userName: user.name,
        })
      )
    );
  } catch (error) {
    console.error("Failed to send some invitation emails:", error);
    // We don't throw here as enrollments were successful
  }
  // Return structured API response
  return res.status(200).json(
    new ApiResponse("STUDENT_INVITED", {
      enrollments: enrollments.map((e) => ({
        id: e.id,
        exam_id: e.exam_id,
        user_id: e.user_id,
        created_at: e.created_at,
      })),
      enrolledCount: enrollments.length,
      totalEmails: emails.length,
    })
  );
};
