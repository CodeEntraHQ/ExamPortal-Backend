import sequelize from "../db/index.js";
import User from "../models/user.model.js";
import Exam from "../models/exam.model.js";
import Enrollment from "../models/enrollment.model.js";
import Question from "../models/question.model.js";

const inviteStudent = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // console.log("req.body>>>>>>", req.body);
    const { exam_id, student_emails } = req.body;

    const user = req.user;

    if (!["ADMIN", "SUPERADMIN"].includes(user.role)) {
      return res.status(403).json({
        status: "FAILURE",
        responseMsg: "AUTHENTICATION_FAILED",
      });
    }

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

    const foundEmails = validStudents.map((s) => s.email);
    const notFoundEmails = student_emails.filter(
      (email) => !foundEmails.includes(email)
    );

    if (validStudents.length === 0) {
      return res.status(404).json({
        status: "FAILURE",
        responseMsg: `No students found for emails: ${student_emails.join(
          ", "
        )}`,
      });
    }

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

    const newEnrollments = await Promise.all(
      validStudents
        .filter((student) => !alreadyEnrolledIds.has(student.id))
        .map(async (student) => ({
          exam_id,
          user_id: student.id,
        }))
    );

    if (newEnrollments.length === 0) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "STUDENTS_ALREADY_ENROLLED",
      });
    }

    await Enrollment.bulkCreate(newEnrollments, {
      transaction: t,
      individualHooks: true,
    });
    await t.commit();

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

export { inviteStudent };
