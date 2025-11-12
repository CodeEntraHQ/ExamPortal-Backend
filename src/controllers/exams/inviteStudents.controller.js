import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import Result from "#models/result.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const inviteStudent = ApiHandler(async (req, res) => {
  // Parsing request - exam_id from URL params, entity_id and student_emails from body
  const exam_id = req.params.id?.trim();
  const entity_id = req.body.entity_id?.trim();
  const student_emails = req.body.student_emails;

  // Validate exam exists
  const exam = await Exam.findByPk(exam_id);
  if (!exam) {
    throw new ApiError(400, "BAD_REQUEST", "Exam not found");
  }

  // Validate entity_id matches exam's entity_id
  if (exam.entity_id !== entity_id) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Entity ID does not match exam's entity"
    );
  }

  const targetEntityId = entity_id;

  // Get all students with matching emails
  const allStudents = await User.findAll({
    where: {
      email: student_emails,
      role: "STUDENT",
    },
  });

  // Process each email individually to provide detailed results
  const results = [];
  const validStudentMap = new Map();
  const validStudentIds = [];

  // Build map of valid students (same entity)
  allStudents.forEach((student) => {
    if (student.entity_id === targetEntityId) {
      validStudentMap.set(student.email, student);
      validStudentIds.push(student.id);
    }
  });

  // Get existing enrollments for valid students
  const existingEnrollments = await Enrollment.findAll({
    where: {
      exam_id,
      user_id: validStudentIds,
    },
  });

  const alreadyEnrolledIds = new Set(existingEnrollments.map((e) => e.user_id));

  // Process each email
  const newEnrollments = [];
  for (const email of student_emails) {
    const student = validStudentMap.get(email);

    if (!student) {
      // Check if student exists but with different entity
      const studentWithDifferentEntity = allStudents.find(
        (s) => s.email === email
      );
      if (studentWithDifferentEntity) {
        results.push({
          email,
          success: false,
          reason: "Student belongs to a different entity",
        });
      } else {
        results.push({
          email,
          success: false,
          reason: "Student not found",
        });
      }
      continue;
    }

    if (alreadyEnrolledIds.has(student.id)) {
      results.push({
        email,
        success: false,
        reason: "Student already enrolled",
      });
      continue;
    }

    // Valid student to enroll
    newEnrollments.push({
      exam_id,
      user_id: student.id,
    });
    results.push({
      email,
      success: true,
      reason: "Invited successfully",
    });
  }

  // Create enrollments if any
  if (newEnrollments.length > 0) {
    await Enrollment.bulkCreate(newEnrollments, {
      individualHooks: true,
    });

    // Initialize result for each new enrollment
    const resultInitializations = newEnrollments.map((enrollment) => ({
      user_id: enrollment.user_id,
      exam_id: enrollment.exam_id,
      score: null,
      metadata: {
        correct_answer: 0,
        incorrect_answer: 0,
        no_answers: 0,
      },
    }));

    // Use findOrCreate to avoid duplicates if result already exists
    await Promise.all(
      resultInitializations.map((resultData) =>
        Result.findOrCreate({
          where: {
            user_id: resultData.user_id,
            exam_id: resultData.exam_id,
          },
          defaults: resultData,
        })
      )
    );
  }

  // Send response with detailed results
  return res.status(200).json(
    new ApiResponse("STUDENT_INVITED", {
      results,
      totalInvited: results.filter((r) => r.success).length,
      totalFailed: results.filter((r) => !r.success).length,
    })
  );
});
