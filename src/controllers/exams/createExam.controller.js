import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiHandler } from "#utils/api-handler/handler.js";

export const createExam = ApiHandler(async (req, res) => {
  // Parsing request
  const { title, type } = req.body;

  // Request assertion
  if ([title, type].some((field) => !field || String(field).trim() === "")) {
    throw new ApiError(400, "BAD_REQUEST", "title and type are required");
  }

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
