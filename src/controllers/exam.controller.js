import sequelize from "../db/index.js";
import User from "../models/user.model.js";
import Exam from "../models/exam.model.js";
import Enrollment from "../models/enrollment.model.js";
import Question from "../models/question.model.js";

const createExam = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, type } = req.body;

    if ([title, type].some((field) => !field || String(field).trim() === "")) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "All_Feild are required",
      });
    }

    const user = req.user;
    // console.log("user>>>>>>>>", user.role);
    if (!(user.role === "ADMIN" || user.role === "SUPERADMIN")) {
      return res.status(403).json({
        status: "FAILURE",
        responseMsg: "AUTHENTICATION_FAILED",
      });
    }

    const newExam = await Exam.create({
      title,
      type,
      user_id: user.id,
      entity_id: user.entity_id,
      active: true,
    });
    await t.commit();
    return res.status(201).json({
      status: "SUCCESS",
      responseMsg: "EXAM_CREATED",
      payload: {
        id: newExam.id,
        title: newExam.title,
      },
    });
  } catch (error) {
    console.error("Exam creation error:", error);
    await t.rollback();
    return res.status(500).json({
      status: "FAILURE",
      responseMsg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const createQuestion = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { exam_id, question_text, type, metadata } = req.body;
    const user = req.user;
    if (!(user.role === "ADMIN" || user.role === "SUPERADMIN")) {
      return res.status(403).json({
        status: "FAILURE",
        responseMsg: "AUTHENTICATION_FAILED",
      });
    }

    if (
      [exam_id, question_text, type].some(
        (field) => !field || String(field).trim() === ""
      )
    ) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "ALL_FIELDS_REQUIRED",
      });
    }

    if (type === "MCQ") {
      if (
        !metadata?.options ||
        !Array.isArray(metadata.options) ||
        metadata.options.length < 2 ||
        !Array.isArray(metadata.correct_answers)
      ) {
        return res.status(400).json({
          status: "FAILURE",
          responseMsg: "INVALID_METADATA_FOR_MCQ",
        });
      }
    }

    const question = await Question.create({
      exam_id,
      question_text,
      type,
      metadata,
    });
    await t.commit();
    return res.status(201).json({
      status: "success",
      responseMsg: "QUESTION_CREATED",
      payload: {
        question_id: question.id,
      },
    });
  } catch (error) {
    console.error("Question creation error:", error);
    await t.rollback();
    return res.status(500).json({
      status: "FAILURE",
      responseMsg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!["SUPERADMIN", "ADMIN", "STUDENT"].includes(req.user.role)) {
      return res.status(401).json({
        status: "FAILURE",
        responseMsg: "AUTHENTICATION_FAILED",
      });
    }

    const { rows, count: total } = await Question.findAndCountAll({
      offset,
      limit,
      attributes: ["id", "question_text", "type", "metadata"],
      order: [["created_at", "ASC"]],
    });

    // Sanitize metadata (remove correct_answers)
    const questions = rows.map((question) => {
      const { id, question_text, type, metadata } = question;

      // Create a shallow copy of metadata and remove 'correct_answers'
      const sanitizedMetadata = { ...metadata };
      delete sanitizedMetadata.correct_answers;

      return {
        id,
        question_text,
        type,
        metadata: sanitizedMetadata,
      };
    });

    return res.json({
      status: "success",
      responseMsg: "QUESTIONS_FETCHED",
      payload: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        questions,
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({
      status: "FAILURE",
      responseMsg: "INTERNAL_SERVER_ERROR",
    });
  }
};


const inviteStudent  = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { exam_id, student_emails } = req.body; 
    const user = req.user;

    if (!["ADMIN", "SUPERADMIN"].includes(user.role)) {
      return res.status(403).json({
        status: "FAILURE",
        responseMsg: "AUTHENTICATION_FAILED",
      });
    }

    // Field validation
    if (
      !exam_id ||
      !Array.isArray(student_emails) ||
      student_emails.length === 0
    ) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "exam_id and student_emails are required",
      });
    }

    // Check if exam exists
    const exam = await Exam.findByPk(exam_id);
    if (!exam) {
      return res.status(404).json({
        status: "FAILURE",
        responseMsg: "EXAM_NOT_FOUND",
      });
    }

    // Get valid students using email
    const validStudents = await User.findAll({
      where: {
        email: student_emails,
        role: "STUDENT",
      },
    });

    // Check if some emails are invalid
    const foundEmails = validStudents.map((s) => s.email);
    const notFoundEmails = student_emails.filter(
      (email) => !foundEmails.includes(email)
    );

    // If all are invalid
    if (validStudents.length === 0) {
      return res.status(404).json({
        status: "FAILURE",
        responseMsg: `No students found for emails: ${student_emails.join(", ")}`,
      });
    }

    // Prevent duplicate enrollments
    const studentIds = validStudents.map((s) => s.id);
    const existingEnrollments = await Enrollment.findAll({
      where: {
        exam_id,
        user_id: studentIds,
      },
    });

    const alreadyEnrolledIds = new Set(
      existingEnrollments.map((e) => e.user_id)
    );

    const newEnrollments = validStudents
      .filter((student) => !alreadyEnrolledIds.has(student.id))
      .map((student) => ({
        exam_id,
        user_id: student.id,
      }));

    if (newEnrollments.length === 0) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "STUDENTS_ALREADY_ENROLLED",
      });
    }

    // Insert valid students
    await Enrollment.bulkCreate(newEnrollments, { transaction: t });
    await t.commit();

    // Response: Success + invalid emails (if any)
    return res.status(200).json({
      status: "SUCCESS",
      responseMsg: "STUDENT_INVITED",
      payload: {
        totalInvited: newEnrollments.length,
        invalidEmails: notFoundEmails.length > 0 ? notFoundEmails : [],
      },
    });
  } catch (error) {
    console.error("Invite error:", error);
    await t.rollback();
    return res.status(500).json({
      status: "FAILURE",
      responseMsg: "INTERNAL_SERVER_ERROR",
    });
  }
};


export { createExam, createQuestion, getQuestions, inviteStudent };
