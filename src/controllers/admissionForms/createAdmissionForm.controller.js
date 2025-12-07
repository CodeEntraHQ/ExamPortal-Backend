import AdmissionForm from "#models/admissionForm.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { generateSecureToken } from "#utils/utils.js";

export const createAdmissionForm = ApiHandler(async (req, res) => {
  const exam_id = req.params.exam_id;
  const { form_structure } = req.body;

  // Check if exam exists
  const exam = await Exam.findByPk(exam_id);
  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Check authorization - only ADMIN and SUPERADMIN can create admission forms
  if (req.user.role === "ADMIN" && exam.entity_id !== req.user.entity_id) {
    throw new ApiError(403, "FORBIDDEN", "You don't have access to this exam");
  }

  // Check if admission form already exists
  const existingForm = await AdmissionForm.findOne({
    where: { exam_id },
  });

  if (existingForm) {
    throw new ApiError(
      409,
      "ADMISSION_FORM_EXISTS",
      "Admission form already exists for this exam. Use update endpoint instead."
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

  // Generate public token for anonymous access
  let publicToken;
  let isUnique = false;
  while (!isUnique) {
    publicToken = generateSecureToken(32);
    const existing = await AdmissionForm.findOne({
      where: { public_token: publicToken },
    });
    if (!existing) {
      isUnique = true;
    }
  }

  // Create admission form
  const admissionForm = await AdmissionForm.create({
    exam_id,
    form_structure,
    public_token: publicToken,
  });

  return res.status(200).json(
    new ApiResponse("ADMISSION_FORM_CREATED", {
      id: admissionForm.id,
      exam_id: admissionForm.exam_id,
      form_structure: admissionForm.form_structure,
      public_token: admissionForm.public_token,
      created_at: admissionForm.created_at,
    })
  );
});
