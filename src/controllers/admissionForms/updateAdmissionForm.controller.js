import AdmissionForm from "#models/admissionForm.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const updateAdmissionForm = ApiHandler(async (req, res) => {
  const { exam_id } = req.params;
  const { form_structure } = req.body;

  // Check if exam exists
  const exam = await Exam.findByPk(exam_id);
  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Check authorization
  if (req.user.role === "ADMIN" && exam.entity_id !== req.user.entity_id) {
    throw new ApiError(403, "FORBIDDEN", "You don't have access to this exam");
  }

  // Find admission form
  const admissionForm = await AdmissionForm.findOne({
    where: { exam_id },
  });

  if (!admissionForm) {
    throw new ApiError(
      404,
      "NOT_FOUND",
      "Admission form not found for this exam. Use create endpoint instead."
    );
  }

  // Validate form structure
  if (!form_structure || !Array.isArray(form_structure)) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "form_structure must be an array of field definitions"
    );
  }

  // Update admission form
  admissionForm.form_structure = form_structure;
  admissionForm.updated_at = new Date();
  await admissionForm.save();

  return res.status(200).json(
    new ApiResponse("ADMISSION_FORM_UPDATED", {
      id: admissionForm.id,
      exam_id: admissionForm.exam_id,
      form_structure: admissionForm.form_structure,
      created_at: admissionForm.created_at,
      updated_at: admissionForm.updated_at,
    })
  );
});
