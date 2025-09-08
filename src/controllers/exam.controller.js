import sequelize from "../db/index.js";
import User from "../models/user.model.js";
import Exam from "../models/exam.model.js";
import Question from "../models/question.model.js";
import Submission from "../models/submission.model.js";
import Result from "../models/result.model.js";

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

const fetchExams = async (req, res) => {
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

    const { rows, count: total } = await Exam.findAndCountAll({
      offset,
      limit,
      order: [["created_at", "ASC"]],
    });

    // Sanitize questions (remove correct_answers from metadata)
    const exams = rows.map((exam) => {
      return {
        id: exam.id,
        title: exam.title,
        metadata: exam.metadata,
        type: exam.type,
        user_id: exam.user_id,
        entity_id: exam.entity_id,
        active: exam.active,
        created_at: exam.created_at,
      };
    });

    // ✅ Response
    return res.json({
      status: "success",
      responseMsg: "EXAMS_FETCHED",
      payload: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        exams,
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

const submitExam = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { exam_id, answers } = req.body;
    const user = req.user;

    // if (user.role !== "STUDENT") {
    //   return res.status(403).json({
    //     status: "FAILURE",
    //     responseMsg: "AUTHENTICATION_FAILED",
    //   });
    // }

    if (!exam_id || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "exam_id and answers are required",
      });
    }

    const exam = await Exam.findByPk(exam_id);
    if (!exam) {
      return res.status(404).json({
        status: "FAILURE",
        responseMsg: "EXAM_NOT_FOUND",
      });
    }

    // ✅ Check if already submitted
    const existingResult = await Result.findOne({
      where: { user_id: user.id, quiz_id: exam_id },
    });

    if (existingResult) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "USER_ALREADY_SUBMITTED",
      });
    }

    const questions = await Question.findAll({ where: { exam_id } });

    let score = 0;

    const submissions = [];

    for (const ans of answers) {
      const question = questions.find((q) => q.id === ans.question_id);

      if (!question) continue; // skip invalid question_id

      const correctAnswers = question.metadata?.correct_answers || [];
      const isCorrect =
        Array.isArray(ans.answer) &&
        ans.answer.length === correctAnswers.length &&
        ans.answer.every((a) => correctAnswers.includes(a));

      if (isCorrect) score++;

      submissions.push({
        quiz_id: exam_id,
        user_id: user.id,
        question_id: question.id,
        metadata: { submitted_answer: ans.answer, isCorrect },
      });
    }

    await Submission.bulkCreate(submissions, { transaction: t });

    await Result.create(
      {
        user_id: user.id,
        quiz_id: exam_id,
        score,
        metadata: { totalQuestions: questions.length },
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(200).json({
      status: "success",
      responseMsg: "EXAM_SUBMITTED",
      payload: {
        score,
      },
    });
  } catch (error) {
    console.error("Submit Exam error:", error);
    await t.rollback();
    return res.status(500).json({
      status: "FAILURE",
      responseMsg: "INTERNAL_SERVER_ERROR",
    });
  }
};

export { createExam, fetchExams, submitExam };
