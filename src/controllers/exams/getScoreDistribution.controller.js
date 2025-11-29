import Exam from "#models/exam.model.js";
import Result from "#models/result.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getScoreDistribution = ApiHandler(async (req, res) => {
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
    attributes: ["id"],
  });

  if (exams.length === 0) {
    return res.status(200).json(
      new ApiResponse("SCORE_DISTRIBUTION_FETCHED", {
        distribution: [
          { name: "Excellent (90-100)", value: 0, percentage: 0 },
          { name: "Good (80-89)", value: 0, percentage: 0 },
          { name: "Average (70-79)", value: 0, percentage: 0 },
          { name: "Below Average (60-69)", value: 0, percentage: 0 },
          { name: "Poor (<60)", value: 0, percentage: 0 },
        ],
      })
    );
  }

  const examIds = exams.map((exam) => exam.id);

  // Fetch all results for these exams with score
  const results = await Result.findAll({
    where: { exam_id: examIds },
    attributes: ["id", "exam_id", "score", "metadata"],
  });

  if (results.length === 0) {
    return res.status(200).json(
      new ApiResponse("SCORE_DISTRIBUTION_FETCHED", {
        distribution: [
          { name: "Excellent (90-100)", value: 0, percentage: 0 },
          { name: "Good (80-89)", value: 0, percentage: 0 },
          { name: "Average (70-79)", value: 0, percentage: 0 },
          { name: "Below Average (60-69)", value: 0, percentage: 0 },
          { name: "Poor (<60)", value: 0, percentage: 0 },
        ],
      })
    );
  }

  // Fetch exam metadata to get total marks for each exam
  const examsWithMetadata = await Exam.findAll({
    where: { id: examIds },
    attributes: ["id", "metadata"],
  });

  const examTotalMarksMap = new Map();
  examsWithMetadata.forEach((exam) => {
    const totalMarks = exam.metadata?.totalMarks || 0;
    examTotalMarksMap.set(exam.id, totalMarks);
  });

  // Calculate score percentages for each result using original score
  const scorePercentages = [];
  for (const result of results) {
    const examId = result.exam_id;
    const score =
      result.score !== null && result.score !== undefined ? result.score : 0;
    const totalMarks = examTotalMarksMap.get(examId) || 0;

    // Calculate percentage: (score / total marks) * 100
    const percentage =
      totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    if (percentage > 0) {
      scorePercentages.push(percentage);
    }
  }

  // Categorize scores into buckets
  const excellent = scorePercentages.filter((p) => p >= 90 && p <= 100).length;
  const good = scorePercentages.filter((p) => p >= 80 && p < 90).length;
  const average = scorePercentages.filter((p) => p >= 70 && p < 80).length;
  const belowAverage = scorePercentages.filter((p) => p >= 60 && p < 70).length;
  const poor = scorePercentages.filter((p) => p < 60).length;

  const total = scorePercentages.length;

  // Calculate percentages
  const distribution = [
    {
      name: "Excellent (90-100)",
      value: excellent,
      percentage: total > 0 ? Math.round((excellent / total) * 100) : 0,
    },
    {
      name: "Good (80-89)",
      value: good,
      percentage: total > 0 ? Math.round((good / total) * 100) : 0,
    },
    {
      name: "Average (70-79)",
      value: average,
      percentage: total > 0 ? Math.round((average / total) * 100) : 0,
    },
    {
      name: "Below Average (60-69)",
      value: belowAverage,
      percentage: total > 0 ? Math.round((belowAverage / total) * 100) : 0,
    },
    {
      name: "Poor (<60)",
      value: poor,
      percentage: total > 0 ? Math.round((poor / total) * 100) : 0,
    },
  ];

  // Send response
  return res.status(200).json(
    new ApiResponse("SCORE_DISTRIBUTION_FETCHED", {
      distribution,
    })
  );
});
