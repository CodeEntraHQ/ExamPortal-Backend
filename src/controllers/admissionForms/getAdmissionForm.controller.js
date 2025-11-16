import AdmissionForm from "#models/admissionForm.model.js";
import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const getAdmissionForm = ApiHandler(async (req, res) => {
  const { exam_id } = req.params;

  // Check if exam exists
  const exam = await Exam.findByPk(exam_id);
  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Check authorization
  if (req.user.role === "ADMIN" && exam.entity_id !== req.user.entity_id) {
    throw new ApiError(403, "FORBIDDEN", "You don't have access to this exam");
  }

  // For representatives, check if they have an enrollment with ASSIGNED status
  if (req.user.role === "REPRESENTATIVE") {
    const enrollment = await Enrollment.findOne({
      where: {
        exam_id: exam_id,
        user_id: req.user.id,
        status: ENROLLMENT_STATUS.ASSIGNED,
      },
    });

    if (!enrollment) {
      throw new ApiError(
        403,
        "FORBIDDEN",
        "You don't have access to this exam's admission form"
      );
    }
  }

  // Find admission form
  const admissionForm = await AdmissionForm.findOne({
    where: { exam_id },
  });

  if (!admissionForm) {
    throw new ApiError(
      404,
      "NOT_FOUND",
      "Admission form not found for this exam"
    );
  }

  return res.status(200).json(
    new ApiResponse("ADMISSION_FORM_FETCHED", {
      id: admissionForm.id,
      exam_id: admissionForm.exam_id,
      form_structure: admissionForm.form_structure,
      created_at: admissionForm.created_at,
      updated_at: admissionForm.updated_at,
    })
  );
});
