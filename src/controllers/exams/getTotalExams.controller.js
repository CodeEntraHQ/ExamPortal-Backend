import Exam from "#models/exam.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getTotalExams = ApiHandler(async (req, res) => {
  // Get total count of all exams
  const totalExams = await Exam.count();

  // Get count of active exams
  const activeExams = await Exam.count({
    where: { active: true },
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("TOTAL_EXAMS_FETCHED", {
      totalExams,
      activeExams,
    })
  );
});
