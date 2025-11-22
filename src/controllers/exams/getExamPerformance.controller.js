import Exam from "#models/exam.model.js";
import Question from "#models/question.model.js";
import Result from "#models/result.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getExamPerformance = ApiHandler(async (req, res) => {
  const entity_id = req.query.entity_id;

  // Request assertion
  if (
    (req.user.role === "SUPERADMIN" && !entity_id) ||
    (req.user.role !== "SUPERADMIN" && entity_id)
  ) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "entity_id is required for SUPERADMIN"
    );
  }

  // Determine entity_id based on user role
  let targetEntityId = entity_id;
  if (req.user.role === "ADMIN") {
    targetEntityId = req.user.entity_id;
  }

  // Fetch all exams for the entity
  const exams = await Exam.findAll({
    where: { entity_id: targetEntityId },
    attributes: ["id", "title"],
    order: [["created_at", "DESC"]],
    limit: 10, // Limit to 10 most recent exams for performance
  });

  if (exams.length === 0) {
    return res.status(200).json(
      new ApiResponse("EXAM_PERFORMANCE_FETCHED", {
        performance: [],
      })
    );
  }

  const examIds = exams.map((exam) => exam.id);

  // Fetch all results for these exams
  const results = await Result.findAll({
    where: { exam_id: examIds },
    attributes: ["id", "exam_id", "metadata"],
  });

  // Count questions per exam
  const questionCountsMap = new Map();
  for (const examId of examIds) {
    const count = await Question.count({ where: { exam_id: examId } });
    questionCountsMap.set(examId, count);
  }

  // Group results by exam and calculate average score
  const examPerformanceMap = new Map();

  for (const exam of exams) {
    examPerformanceMap.set(exam.id, {
      examId: exam.id,
      examName: exam.title,
      scores: [],
      totalStudents: 0,
    });
  }

  // Calculate score percentage for each result
  for (const result of results) {
    const examId = result.exam_id;
    const examData = examPerformanceMap.get(examId);

    if (!examData) continue;

    const metadata = result.metadata || {};
    const correctAnswers = metadata.correct_answer || 0;
    const incorrectAnswers = metadata.incorrect_answer || 0;
    const noAnswers = metadata.no_answers || 0;

    // Total questions = correct + incorrect + no answers
    const totalQuestions = correctAnswers + incorrectAnswers + noAnswers;

    // Use question count from database if available, otherwise use calculated total
    const questionCount = questionCountsMap.get(examId) || totalQuestions;

    // Calculate percentage: (correct answers / total questions) * 100
    const percentage =
      questionCount > 0
        ? Math.round((correctAnswers / questionCount) * 100)
        : 0;

    if (percentage > 0) {
      examData.scores.push(percentage);
      examData.totalStudents += 1;
    }
  }

  // Calculate average score for each exam
  const performance = Array.from(examPerformanceMap.values())
    .map((examData) => {
      const avgScore =
        examData.scores.length > 0
          ? Math.round(
              examData.scores.reduce((sum, score) => sum + score, 0) /
                examData.scores.length
            )
          : 0;

      return {
        examName: examData.examName,
        avgScore: avgScore,
        exams: 1, // Each entry represents one exam
        students: examData.totalStudents,
      };
    })
    .filter((item) => item.students > 0) // Only include exams with students
    .sort((a, b) => b.avgScore - a.avgScore); // Sort by average score descending

  // Send response
  return res.status(200).json(
    new ApiResponse("EXAM_PERFORMANCE_FETCHED", {
      performance,
    })
  );
});
