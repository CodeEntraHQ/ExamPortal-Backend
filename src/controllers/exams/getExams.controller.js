import AdmissionForm from "#models/admissionForm.model.js";
import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getExams = ApiHandler(async (req, res) => {
  // Parsing request
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const entity_id = req.query.entity_id;

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

  // Prepare the query
  let query = {
    offset,
    limit,
    order: [["created_at", "ASC"]],
  };

  if (req.user.role === "STUDENT") {
    const enrollments = await Enrollment.findAll({
      where: { user_id: req.user.id },
      attributes: ["exam_id"],
    });
    const examIds = enrollments.map((e) => e.exam_id);
    query.where = { id: examIds };
  } else if (req.user.role === "ADMIN") {
    query.where = { entity_id: req.user.entity_id };
  } else if (req.user.role === "SUPERADMIN") {
    query.where = { entity_id: req.query.entity_id };
  }

  // Fetch exams
  const { rows, count: total } = await Exam.findAndCountAll(query);

  // Get all exam IDs to check for admission forms
  const examIds = rows.map((exam) => exam.id);
  const admissionForms = await AdmissionForm.findAll({
    where: { exam_id: examIds },
    attributes: ["exam_id"],
  });
  const examIdsWithForms = new Set(admissionForms.map((form) => form.exam_id));

  // Sanitize exams - include all fields including metadata
  const exams = rows.map((exam) => {
    return {
      id: exam.id,
      title: exam.title,
      type: exam.type,
      active: exam.active,
      created_at: exam.created_at,
      duration_seconds: exam.duration_seconds,
      metadata: exam.metadata || null,
      entity_id: exam.entity_id,
      results_visible: exam.results_visible ?? false,
      has_admission_form: examIdsWithForms.has(exam.id),
    };
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("EXAMS_FETCHED", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      exams,
    })
  );
});
