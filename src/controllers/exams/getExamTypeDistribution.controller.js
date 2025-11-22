import Exam from "#models/exam.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { EXAM_TYPE } from "#utils/constants/model.constant.js";

export const getExamTypeDistribution = ApiHandler(async (req, res) => {
  // Get total count for percentage calculation
  const totalExams = await Exam.count();

  // Get count for each exam type
  const distribution = await Promise.all(
    Object.values(EXAM_TYPE).map(async (type) => {
      const count = await Exam.count({
        where: { type },
      });
      const percentage =
        totalExams > 0 ? Math.round((count / totalExams) * 100) : 0;

      // Map backend types to display-friendly names
      const displayName = type === EXAM_TYPE.QUIZ ? "QUIZ" : "OTHER";

      return {
        name: displayName,
        value: count,
        percentage: percentage,
      };
    })
  );

  // Send response
  return res.status(200).json(
    new ApiResponse("EXAM_TYPE_DISTRIBUTION_FETCHED", {
      distribution,
      total: totalExams,
    })
  );
});
