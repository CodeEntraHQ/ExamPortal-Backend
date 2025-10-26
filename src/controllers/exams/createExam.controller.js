import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const createExam = ApiHandler(async (req, res) => {
  // Parsing request
  const title = req.body.title?.trim();
  const type = req.body.type?.trim();
  const entity_id = req.body.entity_id?.trim();
  const duration_seconds = req.body.duration_seconds;
  const metadata = req.body.metadata;

  // Validate required fields
  if (!title || !type || !duration_seconds) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "title, type, and duration_seconds are required"
    );
  }

  // request assertion for entity_id
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

  // Validate metadata
  if (metadata) {
    if (
      typeof metadata.totalMarks !== "number" ||
      typeof metadata.passingMarks !== "number"
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "metadata.totalMarks and metadata.passingMarks must be numbers"
      );
    }

    if (metadata.passingMarks > metadata.totalMarks) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Passing marks cannot be greater than total marks"
      );
    }
  }

  // Create exam
  const newExam = await Exam.create({
    title,
    type,
    duration_seconds,
    metadata,
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
