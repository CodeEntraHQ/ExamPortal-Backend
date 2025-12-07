import AdmissionForm from "#models/admissionForm.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { generateSecureToken } from "#utils/utils.js";

export const getPublicToken = ApiHandler(async (req, res) => {
  const { exam_id } = req.params;

  // Check if exam exists
  const exam = await Exam.findByPk(exam_id);
  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Check authorization - only ADMIN and SUPERADMIN can get public token
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
      "Admission form not found for this exam"
    );
  }

  // Generate public token if it doesn't exist
  if (!admissionForm.public_token) {
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
    admissionForm.public_token = publicToken;
    await admissionForm.save();
  }

  return res.status(200).json(
    new ApiResponse("PUBLIC_TOKEN_FETCHED", {
      public_token: admissionForm.public_token,
    })
  );
});
