import Exam from "#models/exam.model.js";
import Result from "#models/result.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";

export const getExamScoreDistribution = ApiHandler(async (req, res) => {
  const { id } = req.params;

  // Find exam
  const exam = await Exam.findByPk(id);

  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Check if admin/superadmin has access (entity check)
  if (
    req.user.role === USER_ROLES.ADMIN &&
    exam.entity_id !== req.user.entity_id
  ) {
    throw new ApiError(403, "FORBIDDEN", "You don't have access to this exam");
  }

  // Fetch all results for this exam with score
  const results = await Result.findAll({
    where: { exam_id: id },
    attributes: ["id", "exam_id", "score", "metadata"],
  });

  if (results.length === 0) {
    return res.status(200).json(
      new ApiResponse("EXAM_SCORE_DISTRIBUTION_FETCHED", {
        distribution: [
          { range: "90-100", count: 0, percentage: 0 },
          { range: "80-89", count: 0, percentage: 0 },
          { range: "70-79", count: 0, percentage: 0 },
          { range: "60-69", count: 0, percentage: 0 },
          { range: "<60", count: 0, percentage: 0 },
        ],
      })
    );
  }

  // Get total marks from exam metadata
  const totalMarks = exam.metadata?.totalMarks || 0;

  // Calculate score percentages for each result using original score
  const scorePercentages = [];
  for (const result of results) {
    const score =
      result.score !== null && result.score !== undefined ? result.score : 0;

    // Calculate percentage: (score / total marks) * 100
    const percentage =
      totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    if (percentage >= 0) {
      scorePercentages.push(percentage);
    }
  }

  // Categorize scores into buckets for bar chart
  const excellent = scorePercentages.filter((p) => p >= 90 && p <= 100).length;
  const good = scorePercentages.filter((p) => p >= 80 && p < 90).length;
  const average = scorePercentages.filter((p) => p >= 70 && p < 80).length;
  const belowAverage = scorePercentages.filter((p) => p >= 60 && p < 70).length;
  const poor = scorePercentages.filter((p) => p < 60).length;

  const total = scorePercentages.length;

  // Calculate percentages
  const distribution = [
    {
      range: "90-100",
      count: excellent,
      percentage: total > 0 ? Math.round((excellent / total) * 100) : 0,
    },
    {
      range: "80-89",
      count: good,
      percentage: total > 0 ? Math.round((good / total) * 100) : 0,
    },
    {
      range: "70-79",
      count: average,
      percentage: total > 0 ? Math.round((average / total) * 100) : 0,
    },
    {
      range: "60-69",
      count: belowAverage,
      percentage: total > 0 ? Math.round((belowAverage / total) * 100) : 0,
    },
    {
      range: "<60",
      count: poor,
      percentage: total > 0 ? Math.round((poor / total) * 100) : 0,
    },
  ];

  // Send response
  return res.status(200).json(
    new ApiResponse("EXAM_SCORE_DISTRIBUTION_FETCHED", {
      distribution,
    })
  );
});
