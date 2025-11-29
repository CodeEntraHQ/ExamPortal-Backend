import Exam from "#models/exam.model.js";
import Question from "#models/question.model.js";
import Result from "#models/result.model.js";
import Submission from "#models/submission.model.js";

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

  // Get all questions for this exam
  const questions = await Question.findAll({
    where: {
      exam_id,
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
  });

  // Compare each question's correct answer with student's submission
  questions.forEach((question) => {
    const submission = submissionMap.get(question.id);
    const questionMetadata = question.metadata || {};
    const options = questionMetadata.options || [];
    const correctAnswerIndices = questionMetadata.correct_answers || [];

    // Get correct answer texts from indices
    const correctAnswerTexts = correctAnswerIndices
      .map((index) => {
        if (options[index] && options[index].text) {
          return options[index].text;
        }
        return null;
      })
      .filter((text) => text !== null);

    if (!submission || !submission.metadata || !submission.metadata.answer) {
      // No answer provided
      noAnswers++;
    } else {
      const studentAnswer = submission.metadata.answer;

      // Check if answer is correct
      let isCorrect = false;

      if (Array.isArray(studentAnswer)) {
        // Multiple choice answer (array of texts)
        // For multiple correct answers, student must select exactly all correct answers
        if (studentAnswer.length === correctAnswerTexts.length) {
          // Check if all correct answers are selected (order doesn't matter)
          isCorrect = correctAnswerTexts.every((correctText) =>
            studentAnswer.includes(correctText)
          );
        }
      } else {
        // Single choice answer (single text)
        // For single correct answer, check if student answer matches exactly
        if (correctAnswerTexts.length === 1) {
          isCorrect = studentAnswer === correctAnswerTexts[0];
        } else if (correctAnswerTexts.length > 1) {
          // Multiple correct answers possible, check if student selected one of them
          // This handles cases where question allows multiple correct but student selects one
          isCorrect = correctAnswerTexts.includes(studentAnswer);
        }
      }

      if (isCorrect) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    }
  });

  // Calculate score based on marks per question
  const score = Math.round(correctAnswers * marksPerQuestion * 100) / 100; // Round to 2 decimal places

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

  // Update if already exists
  if (!created) {
    await result.update({
      score: score,
      metadata: {
        correct_answer: correctAnswers,
        incorrect_answer: incorrectAnswers,
        no_answers: noAnswers,
        total_questions: totalQuestions,
        total_marks: totalMarks,
        marks_per_question: marksPerQuestion,
      },
    });
  }

  return result;
};
