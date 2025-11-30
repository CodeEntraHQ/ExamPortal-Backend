import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const updateExam = ApiHandler(async (req, res) => {
  // Parsing request
  const exam_id = req.params.id?.trim();
  const title = req.body.title?.trim();
  const type = req.body.type?.trim();
  const duration_seconds = req.body.duration_seconds;
  const metadata = req.body.metadata;
  const active = req.body.active;
  const results_visible = req.body.results_visible;

  // Validate exam_id
  if (!exam_id) {
    throw new ApiError(400, "BAD_REQUEST", "exam_id is required");
  }

  // Find exam
  const exam = await Exam.findByPk(exam_id);

  if (!exam) {
    throw new ApiError(404, "EXAM_NOT_FOUND", "Exam not found");
  }

  // Check authorization - only SUPERADMIN or ADMIN who owns the entity can update
  if (req.user.role === "SUPERADMIN") {
    // SUPERADMIN can update any exam
  } else if (req.user.role === "ADMIN") {
    // ADMIN can only update exams from their entity
    if (exam.entity_id !== req.user.entity_id) {
      throw new ApiError(
        403,
        "FORBIDDEN",
        "You don't have permission to update this exam"
      );
    }
  } else {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only SUPERADMIN and ADMIN can update exams"
    );
  }

  // Build update data
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (type !== undefined) updateData.type = type;
  if (duration_seconds !== undefined)
    updateData.duration_seconds = duration_seconds;
  if (metadata !== undefined) updateData.metadata = metadata;
  if (active !== undefined) updateData.active = active;
  if (results_visible !== undefined)
    updateData.results_visible = results_visible;

  // Validate metadata if provided
  if (metadata) {
    if (
      metadata.totalMarks !== undefined &&
      typeof metadata.totalMarks !== "number"
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "metadata.totalMarks must be a number"
      );
    }

    if (
      metadata.passingMarks !== undefined &&
      typeof metadata.passingMarks !== "number"
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "metadata.passingMarks must be a number"
      );
    }

    if (
      metadata.totalMarks !== undefined &&
      metadata.passingMarks !== undefined &&
      metadata.passingMarks > metadata.totalMarks
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Passing marks cannot be greater than total marks"
      );
    }
  }

  // Validate required fields for update
  const updatedTitle = updateData.title || exam.title;
  const updatedType = updateData.type || exam.type;
  const updatedDuration =
    updateData.duration_seconds !== undefined
      ? updateData.duration_seconds
      : exam.duration_seconds;

  if (!updatedTitle || !updatedType || updatedDuration === undefined) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "title, type, and duration_seconds cannot be empty"
    );
  }

  // Update exam
  await exam.update(updateData);

  // Refresh exam to get updated data
  await exam.reload();

  // Send response
  return res.status(200).json(
    new ApiResponse("EXAM_UPDATED", {
      id: exam.id,
      title: exam.title,
      type: exam.type,
      active: exam.active,
      created_at: exam.created_at,
      duration_seconds: exam.duration_seconds,
      metadata: exam.metadata,
      results_visible: exam.results_visible,
    })
  );
});
