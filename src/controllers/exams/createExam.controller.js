import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const createExam = ApiHandler(async (req, res) => {
  // Parsing request
  const title = req.body.title?.trim();
  const type = req.body.type?.trim();
  const entity_id = req.body.entity_id?.trim();

  // request assertion
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

  // Create entity
  const newExam = await Exam.create({
    title,
    type,
    user_id: req.user.id,
    entity_id: entity_id || req.user.entity_id,
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
