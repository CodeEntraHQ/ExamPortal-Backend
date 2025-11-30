import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

import sequelize from "../src/db/index.js";
import AdmissionForm from "../src/models/admissionForm.model.js";
import Enrollment from "../src/models/enrollment.model.js";
import Entity from "../src/models/entity.model.js";
import Exam from "../src/models/exam.model.js";
import Question from "../src/models/question.model.js";
import Result from "../src/models/result.model.js";
import User from "../src/models/user.model.js";
import {
  ENTITY_TYPE,
  EXAM_TYPE,
  QUESTION_TYPE,
  USER_ROLES,
  USER_STATUS,
  ENROLLMENT_STATUS,
} from "../src/utils/constants/model.constant.js";

const users = [
  {
    email: "superadmin@example.com",
    password: "password",
    role: USER_ROLES.SUPERADMIN,
  },
  {
    email: "admin@example.com",
    password: "password",
    role: USER_ROLES.ADMIN,
  },
  {
    email: "student@example.com",
    password: "password",
    role: USER_ROLES.STUDENT,
  },
  {
    email: "representative@example.com",
    password: "password",
    role: USER_ROLES.REPRESENTATIVE,
  },
];

const setup = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // Sync database schema to create tables
    await sequelize.sync({ alter: true });
    console.log("Database schema synchronized successfully.");

    // Find or create the dummy entity
    const [entity, entityCreated] = await Entity.findOrCreate({
      where: { name: "Dummy Entity" },
      defaults: {
        address: "Dummy Address",
        type: ENTITY_TYPE.SCHOOL,
        description: "This is a dummy entity created for testing purposes.",
        email: "dummy@example.com",
        phone_number: "9234567890",
      },
    });
    if (entityCreated) {
      console.log("Dummy entity created successfully.");
    } else {
      console.log("Dummy entity already exists, using existing entity.");
    }

    for (const user of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: user.email } });
      if (existingUser) {
        console.log(`User ${user.email} already exists, skipping creation.`);
        continue;
      }

      const password_hash = await bcrypt.hash(user.password, 10);
      // Representatives are now bound to entities (same as other roles)
      const entityId = entity.id;
      await User.create({
        id: randomUUID(),
        email: user.email,
        password_hash,
        role: user.role,
        status: USER_STATUS.ACTIVE,
        name: user.role.toLowerCase(),
        entity_id: entityId,
      });
      console.log(`User ${user.email} created successfully.`);
    }

    // Create dummy exams
    const admin = await User.findOne({ where: { role: USER_ROLES.ADMIN } });

    // Create a sample quiz
    const quiz = await Exam.create({
      id: randomUUID(),
      title: "Basic Mathematics Quiz",
      metadata: {
        totalMarks: 20,
        passingMarks: 12,
        instructions: [
          "Once started, you cannot pause the exam",
          "Make sure you have a stable internet connection",
          "Calculator is allowed for this exam",
          "You can flag questions for review before submitting",
          "Results will be shown immediately after submission",
        ],
      },
      duration_seconds: 3800, // 60 minutes in seconds
      user_id: admin.id,
      entity_id: entity.id,
      type: EXAM_TYPE.QUIZ,
      active: true,
      results_visible: false,
      created_at: new Date(),
    });
    console.log("Sample quiz created successfully.");

    // Create sample questions for the quiz
    const questions = [
      {
        question_text: "What is 2 + 2?",
        type: QUESTION_TYPE.MCQ_SINGLE,
        metadata: {
          options: [{ text: "3" }, { text: "4" }, { text: "5" }, { text: "6" }],
          correct_answers: [1],
        },
      },
      {
        question_text: "What is 5 × 5?",
        type: QUESTION_TYPE.MCQ_SINGLE,
        metadata: {
          options: [
            { text: "15" },
            { text: "20" },
            { text: "25" },
            { text: "30" },
          ],
          correct_answers: [2],
        },
      },
      {
        question_text: "What is 10 ÷ 2?",
        type: QUESTION_TYPE.MCQ_SINGLE,
        metadata: {
          options: [{ text: "3" }, { text: "4" }, { text: "5" }, { text: "6" }],
          correct_answers: [2],
        },
      },
      {
        question_text: "What is 15 - 7?",
        type: QUESTION_TYPE.MCQ_SINGLE,
        metadata: {
          options: [{ text: "6" }, { text: "7" }, { text: "8" }, { text: "9" }],
          correct_answers: [2],
        },
      },
    ];

    for (const question of questions) {
      await Question.create({
        id: randomUUID(),
        exam_id: quiz.id,
        ...question,
      });
    }
    console.log("Sample questions created successfully.");

    // Create another exam with single word questions
    const assignment = await Exam.create({
      id: randomUUID(),
      title: "Vocabulary and Definitions Quiz",
      metadata: {
        totalMarks: 50,
        passingMarks: 25,
        instructions: [
          "Once started, you cannot pause the exam",
          "Make sure you have a stable internet connection",
          "Calculator is allowed for this exam",
          "You can flag questions for review before submitting",
          "Results will be shown immediately after submission",
        ],
      },
      duration_seconds: 7900, // 120 minutes in seconds
      user_id: admin.id,
      entity_id: entity.id,
      type: EXAM_TYPE.QUIZ,
      active: false,
      results_visible: false,
      created_at: new Date(),
    });
    console.log("Sample vocabulary quiz created successfully.");

    // Create single word answer questions
    const singleWordQuestions = [
      {
        question_text: "What is the capital city of France?",
        type: QUESTION_TYPE.SINGLE_WORD,
        metadata: {
          correct_answer: "Paris",
        },
      },
      {
        question_text: "What is the largest planet in our solar system?",
        type: QUESTION_TYPE.SINGLE_WORD,
        metadata: {
          correct_answer: "Jupiter",
        },
      },
      {
        question_text: "What is the chemical symbol for gold?",
        type: QUESTION_TYPE.SINGLE_WORD,
        metadata: {
          correct_answer: "Au",
        },
      },
    ];

    for (const question of singleWordQuestions) {
      await Question.create({
        id: randomUUID(),
        exam_id: assignment.id,
        ...question,
      });
    }
    console.log("Sample single word questions created successfully.");

    // Create an exam with multiple correct answer questions
    const multipleChoiceExam = await Exam.create({
      id: randomUUID(),
      title: "General Knowledge Quiz - Multiple Choice",
      metadata: {
        totalMarks: 30,
        passingMarks: 18,
        instructions: [
          "Once started, you cannot pause the exam",
          "Make sure you have a stable internet connection",
          "Calculator is allowed for this exam",
          "You can flag questions for review before submitting",
          "Results will be shown immediately after submission",
        ],
      },
      duration_seconds: 3600, // 60 minutes in seconds
      user_id: admin.id,
      entity_id: entity.id,
      type: EXAM_TYPE.QUIZ,
      active: true,
      results_visible: false,
      created_at: new Date(),
    });
    console.log("Multiple choice quiz created successfully.");

    // Create questions with multiple correct answers
    const multipleChoiceQuestions = [
      {
        question_text: "Which of the following are programming languages?",
        type: QUESTION_TYPE.MCQ_MULTIPLE,
        metadata: {
          options: [
            { text: "Python" },
            { text: "JavaScript" },
            { text: "HTML" },
            { text: "Java" },
          ],
          correct_answers: [0, 1, 3],
        },
      },
      {
        question_text: "Which of the following are prime numbers?",
        type: QUESTION_TYPE.MCQ_MULTIPLE,
        metadata: {
          options: [{ text: "2" }, { text: "4" }, { text: "7" }, { text: "9" }],
          correct_answers: [0, 2],
        },
      },
      {
        question_text: "Which of the following are continents?",
        type: QUESTION_TYPE.MCQ_MULTIPLE,
        metadata: {
          options: [
            { text: "Asia" },
            { text: "Europe" },
            { text: "Pacific Ocean" },
            { text: "Africa" },
          ],
          correct_answers: [0, 1, 3],
        },
      },
    ];

    for (const question of multipleChoiceQuestions) {
      await Question.create({
        id: randomUUID(),
        exam_id: multipleChoiceExam.id,
        ...question,
      });
    }
    console.log("Multiple choice questions created successfully.");

    // Create admission form for the math exam
    await AdmissionForm.create({
      id: randomUUID(),
      exam_id: quiz.id,
      form_structure: [
        {
          label: "Email",
          type: "EMAIL",
          required: true,
          placeholder: "Enter your email address",
        },
        {
          label: "Full Name",
          type: "TEXT",
          required: true,
          placeholder: "Enter your full name",
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log("Admission form created successfully for math exam.");

    // Enroll the default student in all three exams
    const student = await User.findOne({ where: { role: USER_ROLES.STUDENT } });

    if (student) {
      const enrollments = [
        {
          exam_id: quiz.id,
          user_id: student.id,
          status: ENROLLMENT_STATUS.UPCOMING,
        },
        {
          exam_id: assignment.id,
          user_id: student.id,
          status: ENROLLMENT_STATUS.UPCOMING,
        },
        {
          exam_id: multipleChoiceExam.id,
          user_id: student.id,
          status: ENROLLMENT_STATUS.UPCOMING,
        },
      ];

      await Enrollment.bulkCreate(enrollments, {
        individualHooks: true,
      });
      console.log("Student enrolled in all three exams successfully.");

      // Initialize results for each enrollment
      const resultInitializations = enrollments.map((enrollment) => ({
        id: randomUUID(), // Generate ID manually since bulkCreate doesn't trigger hooks with ignoreDuplicates
        user_id: enrollment.user_id,
        exam_id: enrollment.exam_id,
        score: null,
        metadata: {
          correct_answer: 0,
          incorrect_answer: 0,
          no_answers: 0,
        },
      }));

      await Result.bulkCreate(resultInitializations, {
        ignoreDuplicates: true, // Ignore if result already exists
      });
      console.log("Results initialized for all enrollments successfully.");
    } else {
      console.log("Warning: No student user found to enroll.");
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  } finally {
    await sequelize.close();
  }
};

setup();
