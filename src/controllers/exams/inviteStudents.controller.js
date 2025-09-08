import User from "#models/user.model.js";
import Exam from "#models/exam.model.js";
import Enrollment from "#models/enrollment.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiHandler } from "#utils/api-handler/handler.js";

export const inviteStudent = ApiHandler(async (req, res) => {
  const { exam_id, student_emails } = req.body;

  if (!["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
    throw new ApiError(
      403,
      "AUTHORIZATION_FAILED",
      "User is not an ADMIN or SUPERADMIN"
    );
  }

  // request assertion
  if (
    !exam_id ||
    !Array.isArray(student_emails) ||
    student_emails.length === 0
  ) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "exam_id and student_emails are required"
    );
  }

  const exam = await Exam.findByPk(exam_id);
  if (!exam) {
    throw new ApiError(400, "BAD_REQUEST", "Exam not found");
  }

  // Get valid students using email
  const validStudents = await User.findAll({
    where: {
      email: student_emails,
      role: "STUDENT",
    },
  });

  const foundEmails = validStudents.map((s) => s.email);
  const notFoundEmails = student_emails.filter(
    (email) => !foundEmails.includes(email)
  );

  if (validStudents.length === 0) {
    throw new ApiError(400, "BAD_REQUEST", "No valid students found");
  }

  const studentIds = validStudents.map((s) => s.id);
  const existingEnrollments = await Enrollment.findAll({
    where: {
      exam_id,
      user_id: studentIds,
    },
  });

  const alreadyEnrolledIds = new Set(existingEnrollments.map((e) => e.user_id));

  const newEnrollments = await Promise.all(
    validStudents
      .filter((student) => !alreadyEnrolledIds.has(student.id))
      .map(async (student) => ({
        exam_id,
        user_id: student.id,
      }))
  );

  if (newEnrollments.length === 0) {
    throw new ApiError(400, "BAD_REQUEST", "All students are already enrolled");
  }

  await Enrollment.bulkCreate(newEnrollments, {
    individualHooks: true,
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("STUDENT_INVITED", {
      totalInvited: newEnrollments.length,
      invalidEmails: notFoundEmails.length > 0 ? notFoundEmails : [],
    })
  );
});
