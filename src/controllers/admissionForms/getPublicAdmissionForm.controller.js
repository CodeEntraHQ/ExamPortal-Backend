import AdmissionForm from "#models/admissionForm.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getPublicAdmissionForm = ApiHandler(async (req, res) => {
  const { token } = req.params;

  // Find admission form by public token
  const admissionForm = await AdmissionForm.findOne({
    where: { public_token: token },
  });

  if (!admissionForm) {
    throw new ApiError(
      404,
      "NOT_FOUND",
      "Admission form not found or invalid token"
    );
  }

  // Get exam details for title
  const exam = await Exam.findByPk(admissionForm.exam_id);
  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  return res.status(200).json(
    new ApiResponse("ADMISSION_FORM_FETCHED", {
      id: admissionForm.id,
      exam_id: admissionForm.exam_id,
      exam_title: exam.title,
      form_structure: admissionForm.form_structure,
      created_at: admissionForm.created_at,
      updated_at: admissionForm.updated_at,
    })
  );
});
