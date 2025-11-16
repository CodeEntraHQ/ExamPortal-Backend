import { Op } from "sequelize";

import AdmissionFormSubmission from "#models/admissionFormSubmission.model.js";
import Exam from "#models/exam.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { SUBMISSION_STATUS } from "#utils/constants/model.constant.js";

export const getAdmissionFormSubmissions = ApiHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const entity_id = req.query.entity_id;
  const status = req.query.status || SUBMISSION_STATUS.PENDING;

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

  // Validate status
  if (!Object.values(SUBMISSION_STATUS).includes(status)) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid status");
  }

  // Fetch all exams for the entity
  const exams = await Exam.findAll({
    where: { entity_id: targetEntityId },
    attributes: ["id"],
  });

  if (exams.length === 0) {
    return res.status(200).json(
      new ApiResponse("SUBMISSIONS_FETCHED", {
        total: 0,
        page,
        limit,
        totalPages: 0,
        submissions: [],
      })
    );
  }

  const examIds = exams.map((exam) => exam.id);

  // Fetch submissions with pagination
  const { rows: submissions, count: total } =
    await AdmissionFormSubmission.findAndCountAll({
      where: {
        exam_id: { [Op.in]: examIds },
        status: status,
      },
      limit,
      offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Exam,
          as: "Exam",
          attributes: ["id", "title", "entity_id"],
        },
        {
          model: User,
          as: "Representative",
          attributes: ["id", "name", "email"],
        },
      ],
    });

  // Transform submissions for response
  const submissionsData = submissions.map((submission) => ({
    id: submission.id,
    exam_id: submission.exam_id,
    exam_title: submission.Exam?.title || "Unknown Exam",
    representative_id: submission.representative_id,
    representative_name: submission.Representative?.name || "Unknown",
    representative_email: submission.Representative?.email || "Unknown",
    form_responses: submission.form_responses,
    status: submission.status,
    created_at: submission.created_at,
    updated_at: submission.updated_at,
  }));

  return res.status(200).json(
    new ApiResponse("SUBMISSIONS_FETCHED", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      submissions: submissionsData,
    })
  );
});
