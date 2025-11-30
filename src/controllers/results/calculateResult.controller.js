import Exam from "#models/exam.model.js";
import Question from "#models/question.model.js";
import Result from "#models/result.model.js";
import Submission from "#models/submission.model.js";
import { QUESTION_TYPE } from "#utils/constants/model.constant.js";
import { logInfo, logError, logDebug } from "#utils/logger.js";

/**
 * Validates and checks if a student's answer is correct for a given question
 * @param {Question} question - The question object
 * @param {any} studentAnswer - The student's answer from submission
 * @returns {boolean} - True if answer is correct, false otherwise
 */
const checkAnswerCorrectness = (question, studentAnswer) => {
  const questionMetadata = question.metadata || {};

  switch (question.type) {
    case QUESTION_TYPE.MCQ_SINGLE: {
      // MCQ_SINGLE: Student answer should be a single option index or option text
      // Correct answer is stored as an array with one index in metadata.correct_answers
      const correctAnswerIndices = questionMetadata.correct_answers || [];
      const options = questionMetadata.options || [];

      if (correctAnswerIndices.length !== 1) {
        return false; // Invalid question format
      }

      const correctIndex = correctAnswerIndices[0];
      const correctOption = options[correctIndex];

      if (!correctOption) {
        return false; // Invalid correct answer index
      }

      // Student answer can be:
      // 1. A number (index) - compare directly
      // 2. A string (option text) - compare with correct option text
      if (typeof studentAnswer === "number") {
        return studentAnswer === correctIndex;
      } else if (typeof studentAnswer === "string") {
        return (
          studentAnswer === correctOption.text ||
          studentAnswer === String(correctIndex)
        );
      }

      return false;
    }

    case QUESTION_TYPE.MCQ_MULTIPLE: {
      // MCQ_MULTIPLE: Student answer should be an array of option indices or texts
      // Must match all correct answers exactly (order doesn't matter)
      const correctAnswerIndices = questionMetadata.correct_answers || [];
      const options = questionMetadata.options || [];

      if (!Array.isArray(studentAnswer)) {
        return false; // Student answer must be an array for multiple choice
      }

      if (studentAnswer.length !== correctAnswerIndices.length) {
        return false; // Must select exactly the same number of options
      }

      // Get correct answer texts/indices as a set for comparison
      const correctAnswersSet = new Set(
        correctAnswerIndices.map((idx) => {
          const option = options[idx];
          return option ? option.text : String(idx);
        })
      );

      // Check if all student answers are in the correct answers set
      const studentAnswersSet = new Set(
        studentAnswer.map((ans) => {
          // Handle both index (number) and text (string) formats
          if (typeof ans === "number") {
            const option = options[ans];
            return option ? option.text : String(ans);
          }
          return String(ans);
        })
      );

      // Both sets must have the same size and contain the same elements
      if (correctAnswersSet.size !== studentAnswersSet.size) {
        return false;
      }

      for (const answer of correctAnswersSet) {
        if (!studentAnswersSet.has(answer)) {
          return false;
        }
      }

      return true;
    }

    case QUESTION_TYPE.SINGLE_WORD: {
      // SINGLE_WORD: Student answer should be a string
      // Compare case-insensitively with correct_answer
      const correctAnswer = questionMetadata.correct_answer;

      if (!correctAnswer || typeof correctAnswer !== "string") {
        return false; // Invalid question format
      }

      if (typeof studentAnswer !== "string") {
        return false; // Student answer must be a string
      }

      // Trim and compare case-insensitively
      return (
        studentAnswer.trim().toLowerCase() ===
        correctAnswer.trim().toLowerCase()
      );
    }

    default:
      return false; // Unknown question type
  }
};

/**
 * Calculate and store result for a student's exam submission
 * This function compares student answers with correct answers and stores statistics
 * Score is calculated based on: marks per question = total marks / total questions
 * @param {string} user_id - User ID of the student
 * @param {string} exam_id - Exam ID
 * @returns {Promise<Result>} The created or updated result
 */
export const calculateResult = async (user_id, exam_id) => {
  // Get all submissions for this exam by this user
  const submissions = await Submission.findAll({
    where: {
      exam_id,
      user_id,
    },
  });

  logDebug({
    action: "CALCULATE_RESULT_FETCH_SUBMISSIONS",
    message: {
      exam_id,
      user_id,
      submission_count: submissions.length,
    },
  });

  // Get all questions for this exam
  const questions = await Question.findAll({
    where: {
      exam_id,
    },
  });

  logDebug({
    action: "CALCULATE_RESULT_FETCH_QUESTIONS",
    message: {
      exam_id,
      user_id,
      question_count: questions.length,
    },
  });

  // Get exam details to access total marks
  const exam = await Exam.findByPk(exam_id);
  if (!exam) {
    throw new Error("Exam not found");
  }

  // Get total marks from exam metadata
  const totalMarks = exam.metadata?.totalMarks || 0;
  const totalQuestions = questions.length;

  // Calculate marks per question
  const marksPerQuestion = totalQuestions > 0 ? totalMarks / totalQuestions : 0;

  // Initialize counters
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let noAnswers = 0;

  // Create a map of question_id to submission for quick lookup
  const submissionMap = new Map();
  submissions.forEach((sub) => {
    submissionMap.set(sub.question_id, sub);
    logDebug({
      action: "CALCULATE_RESULT_SUBMISSION_DETAIL",
      message: {
        exam_id,
        user_id,
        question_id: sub.question_id,
        answer: sub.metadata?.answer,
      },
    });
  });

  // Compare each question's correct answer with student's submission
  questions.forEach((question) => {
    const submission = submissionMap.get(question.id);

    if (
      !submission ||
      !submission.metadata ||
      submission.metadata.answer === undefined ||
      submission.metadata.answer === null
    ) {
      // No answer provided
      noAnswers++;
      logDebug({
        action: "CALCULATE_RESULT_NO_ANSWER",
        message: {
          exam_id,
          user_id,
          question_id: question.id,
        },
      });
    } else {
      const studentAnswer = submission.metadata.answer;
      logDebug({
        action: "CALCULATE_RESULT_CHECKING_ANSWER",
        message: {
          exam_id,
          user_id,
          question_id: question.id,
          question_type: question.type,
          student_answer: studentAnswer,
          correct_answers: question.metadata?.correct_answers,
        },
      });

      try {
        const isCorrect = checkAnswerCorrectness(question, studentAnswer);
        logDebug({
          action: "CALCULATE_RESULT_ANSWER_CHECKED",
          message: {
            exam_id,
            user_id,
            question_id: question.id,
            is_correct: isCorrect,
          },
        });

        if (isCorrect) {
          correctAnswers++;
        } else {
          incorrectAnswers++;
        }
      } catch (error) {
        logError({
          action: "CALCULATE_RESULT_ANSWER_CHECK_ERROR",
          message: {
            exam_id,
            user_id,
            question_id: question.id,
            error: error.message,
            stack: error.stack,
          },
        });
        incorrectAnswers++;
      }
    }
  });

  // Calculate score based on marks per question
  const score = Math.round(correctAnswers * marksPerQuestion * 100) / 100; // Round to 2 decimal places

  logInfo({
    action: "CALCULATE_RESULT_SCORES_CALCULATED",
    message: {
      exam_id,
      user_id,
      correct_answers: correctAnswers,
      incorrect_answers: incorrectAnswers,
      no_answers: noAnswers,
      total_questions: totalQuestions,
      total_marks: totalMarks,
      marks_per_question: marksPerQuestion,
      score: score,
    },
  });

  // Find or create result
  const [result, created] = await Result.findOrCreate({
    where: {
      user_id,
      exam_id,
    },
    defaults: {
      user_id,
      exam_id,
      score: score,
      metadata: {
        correct_answer: correctAnswers,
        incorrect_answer: incorrectAnswers,
        no_answers: noAnswers,
        total_questions: totalQuestions,
        total_marks: totalMarks,
        marks_per_question: marksPerQuestion,
      },
    },
  });

  logDebug({
    action: "CALCULATE_RESULT_FIND_OR_CREATE",
    message: {
      exam_id,
      user_id,
      result_id: result.id,
      was_created: created,
      existing_score: result.score,
    },
  });

  // Update if already exists
  if (!created) {
    const updateData = {
      score: score,
      metadata: {
        correct_answer: correctAnswers,
        incorrect_answer: incorrectAnswers,
        no_answers: noAnswers,
        total_questions: totalQuestions,
        total_marks: totalMarks,
        marks_per_question: marksPerQuestion,
      },
    };
    logDebug({
      action: "CALCULATE_RESULT_UPDATE_START",
      message: {
        exam_id,
        user_id,
        result_id: result.id,
        update_data: updateData,
      },
    });
    await result.update(updateData);
    await result.reload(); // Reload to get updated values
    logInfo({
      action: "CALCULATE_RESULT_UPDATE_SUCCESS",
      message: {
        exam_id,
        user_id,
        result_id: result.id,
        new_score: result.score,
        new_metadata: result.metadata,
      },
    });
  } else {
    logInfo({
      action: "CALCULATE_RESULT_CREATE_SUCCESS",
      message: {
        exam_id,
        user_id,
        result_id: result.id,
        score: result.score,
        metadata: result.metadata,
      },
    });
  }

  return result;
};
