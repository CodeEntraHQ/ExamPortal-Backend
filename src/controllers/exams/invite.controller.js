import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import {
  ENROLLMENT_STATUS,
  USER_STATUS,
} from "#utils/constants/model.constant.js";
import { sendExamInvitationEmail } from "#utils/email-handler/triggerEmail.js";

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

  // Fetch exam details for email
  const exam = await Exam.findByPk(examId);
  if (!exam) {
    throw new ApiError(400, "BAD_REQUEST", "Exam not found");
  }

  // Create enrollments for all valid users
  const enrollments = await Enrollment.bulkCreate(
    users.map((user) => ({
      exam_id: examId,
      user_id: user.id,
      status: ENROLLMENT_STATUS.UPCOMING,
      metadata: {
        invited_by: req.user.id,
        invited_at: new Date(),
      },
    }))
  );

  // Send invitation emails to all enrolled students
  console.log("📧 Sending exam invitation emails for exam:", exam.title);
  try {
    const emailPromises = users.map((user) =>
      sendExamInvitationEmail(user.email, exam.title, {
        loginUrl: process.env.LOGIN_PORTAL_URL,
      }).catch((error) => {
        console.error(`⚠️ Failed to send email to ${user.email}:`, {
          email: user.email,
          examTitle: exam.title,
          error: error.message,
          stack: error.stack,
        });
        return false;
      })
    );

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(
      (result) => result === true
    ).length;
    const failedEmails = emailResults.filter(
      (result) => result === false
    ).length;

    console.log(
      `✅ Sent ${successfulEmails} out of ${emailPromises.length} exam invitation emails`
    );
    if (failedEmails > 0) {
      console.error(`❌ Failed to send ${failedEmails} exam invitation emails`);
    }
  } catch (error) {
    console.error("❌ Error sending exam invitation emails:", {
      examTitle: exam.title,
      error: error.message,
      stack: error.stack,
    });
    // We don't throw here as enrollments were successful
  }
  // Return structured API response
  return res.status(200).json(
    new ApiResponse("STUDENT_INVITED", {
      enrollments: enrollments.map((e) => ({
        id: e.id,
        exam_id: e.exam_id,
        user_id: e.user_id,
        status: e.status,
        created_at: e.created_at,
      })),
      enrolledCount: enrollments.length,
      totalEmails: emails.length,
    })
  );
};
