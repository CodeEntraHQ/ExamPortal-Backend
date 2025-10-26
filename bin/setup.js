import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

import sequelize from "../src/db/index.js";
import Entity from "../src/models/entity.model.js";
import Exam from "../src/models/exam.model.js";
import Question from "../src/models/question.model.js";
import User from "../src/models/user.model.js";
import {
  ENTITY_TYPE,
  EXAM_TYPE,
  QUESTION_TYPE,
  USER_ROLES,
  USER_STATUS,
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
];

const setup = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    const entity = await Entity.create({
      name: "Dummy Entity",
      address: "Dummy Address",
      type: ENTITY_TYPE.SCHOOL,
      description: "This is a dummy entity created for testing purposes.",
      email: "dummy@example.com",
      phone_number: "1234567890",
    });
    console.log("Dummy entity created successfully.");

    for (const user of users) {
      const password_hash = await bcrypt.hash(user.password, 10);
      await User.create({
        id: randomUUID(),
        email: user.email,
        password_hash,
        role: user.role,
        status: USER_STATUS.ACTIVE,
        name: user.role.toLowerCase(),
        entity_id: entity.id,
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
        instructions: "Answer all questions. Each question carries 5 marks.",
      },
      duration_seconds: 3800, // 60 minutes in seconds
      user_id: admin.id,
      entity_id: entity.id,
      type: EXAM_TYPE.QUIZ,
      active: true,
      created_at: new Date(),
    });
    console.log("Sample quiz created successfully.");

    // Create sample questions for the quiz
    const questions = [
      {
        question_text: "What is 2 + 2?",
        type: QUESTION_TYPE.MCQ,
        metadata: {
          options: ["3", "4", "5", "6"],
          correctAnswer: "4",
          explanation: "Basic addition: 2 + 2 = 4",
        },
      },
      {
        question_text: "What is 5 × 5?",
        type: QUESTION_TYPE.MCQ,
        metadata: {
          options: ["15", "20", "25", "30"],
          correctAnswer: "25",
          explanation: "Multiplication: 5 × 5 = 25",
        },
      },
      {
        question_text: "What is 10 ÷ 2?",
        type: QUESTION_TYPE.MCQ,
        metadata: {
          options: ["3", "4", "5", "6"],
          correctAnswer: "5",
          explanation: "Division: 10 ÷ 2 = 5",
        },
      },
      {
        question_text: "What is 15 - 7?",
        type: QUESTION_TYPE.MCQ,
        metadata: {
          options: ["6", "7", "8", "9"],
          correctAnswer: "8",
          explanation: "Subtraction: 15 - 7 = 8",
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

    // Create another exam of type OTHER
    const assignment = await Exam.create({
      id: randomUUID(),
      title: "Python Programming Assignment",
      metadata: {
        totalMarks: 50,
        passingMarks: 25,
        instructions:
          "Complete all programming tasks. Include proper comments in your code.",
      },
      duration_seconds: 7900, // 120 minutes in seconds
      user_id: admin.id,
      entity_id: entity.id,
      type: EXAM_TYPE.OTHER,
      active: false,
      created_at: new Date(),
    });
    console.log("Sample assignment created successfully.");

    // Create questions for the programming assignment
    const programmingQuestions = [
      {
        question_text:
          "Write a Python function to find the factorial of a number.",
        type: QUESTION_TYPE.OTHER,
        metadata: {
          sampleInput: "5",
          sampleOutput: "120",
          explanation:
            "Function should calculate factorial using recursion or iteration",
        },
      },
      {
        question_text:
          "Create a Python program to check if a string is palindrome.",
        type: QUESTION_TYPE.OTHER,
        metadata: {
          sampleInput: "radar",
          sampleOutput: "True",
          explanation:
            "Program should handle both case-sensitive and case-insensitive palindromes",
        },
      },
    ];

    for (const question of programmingQuestions) {
      await Question.create({
        id: randomUUID(),
        exam_id: assignment.id,
        ...question,
      });
    }
    console.log("Sample programming questions created successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  } finally {
    await sequelize.close();
  }
};

setup();
