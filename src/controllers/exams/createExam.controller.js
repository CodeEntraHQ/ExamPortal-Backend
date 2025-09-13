import Exam from "#models/exam.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const createExam = ApiHandler(async (req, res) => {
  // Parsing request
  const title = req.body.title?.trim();
  const type = req.body.type?.trim();

  // Create college
  const newExam = await Exam.create({
    title,
    type,
    user_id: req.user.id,
    entity_id: req.user.entity_id,
    active: true,
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("EXAM_CREATED", {
      id: newExam.id,
      title: newExam.title,
    })
  );
});
