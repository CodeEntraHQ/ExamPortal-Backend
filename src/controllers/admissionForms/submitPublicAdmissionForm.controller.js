import AdmissionForm from "#models/admissionForm.model.js";
import AdmissionFormSubmission from "#models/admissionFormSubmission.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

/**
 * Validates a single form field response based on field definition
 */
const validateFieldResponse = (field, value) => {
  // Check required fields
  if (
    field.required &&
    (value === null || value === undefined || value === "")
  ) {
    throw new ApiError(400, "VALIDATION_ERROR", `${field.label} is required`);
  }

  // Skip validation if field is not required and value is empty
  if (
    !field.required &&
    (value === null || value === undefined || value === "")
  ) {
    return;
  }

  // Type-specific validation
  switch (field.type) {
    case "EMAIL": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `${field.label} must be a valid email address`
        );
      }
      break;
    }

    case "PHONE": {
      const phoneRegex = /^[0-9]{10,15}$/;
      const phoneValue = String(value).replace(/[\s\-()]/g, "");
      if (!phoneRegex.test(phoneValue)) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `${field.label} must be a valid phone number (10-15 digits)`
        );
      }
      break;
    }

    case "NUMBER": {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `${field.label} must be a valid number`
        );
      }
      if (
        field.validation?.min !== undefined &&
        numValue < field.validation.min
      ) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `${field.label} must be at least ${field.validation.min}`
        );
      }
      if (
        field.validation?.max !== undefined &&
        numValue > field.validation.max
      ) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `${field.label} must be at most ${field.validation.max}`
        );
      }
      break;
    }

    case "DATE": {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `${field.label} must be a valid date (YYYY-MM-DD)`
        );
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `${field.label} must be a valid date`
        );
      }
      break;
    }

    case "GENDER": {
      const validGenders = ["MALE", "FEMALE", "OTHER"];
      if (!validGenders.includes(value.toUpperCase())) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `${field.label} must be one of: ${validGenders.join(", ")}`
        );
      }
      break;
    }

    case "TEXT":
    case "TEXTAREA":
      if (typeof value !== "string") {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `${field.label} must be a string`
        );
      }
      if (field.validation?.pattern) {
        const patternRegex = new RegExp(field.validation.pattern);
        if (!patternRegex.test(value)) {
          throw new ApiError(
            400,
            "VALIDATION_ERROR",
            `${field.label} does not match the required pattern`
          );
        }
      }
      break;

    default:
      break;
  }
};

/**
 * Validates form responses against form structure
 */
const validateFormResponses = (formStructure, formResponses) => {
  const fieldMap = new Map();
  formStructure.forEach((field) => {
    const key = field.id || field.label;
    fieldMap.set(key, field);
    if (field.id) {
      fieldMap.set(field.label, field);
    }
  });

  for (const field of formStructure) {
    const fieldKey = field.id || field.label;
    const responseValue = formResponses[fieldKey] ?? formResponses[field.label];
    validateFieldResponse(field, responseValue);
  }

  const formFieldKeys = new Set();
  formStructure.forEach((field) => {
    formFieldKeys.add(field.id || field.label);
    formFieldKeys.add(field.label);
  });

  const extraFields = Object.keys(formResponses).filter(
    (key) => !formFieldKeys.has(key)
  );

  if (extraFields.length > 0) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `Unknown fields in form responses: ${extraFields.join(", ")}`
    );
  }
};

export const submitPublicAdmissionForm = ApiHandler(async (req, res) => {
  const { token } = req.params;
  const { form_responses } = req.body;

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

  // Check if exam exists
  const exam = await Exam.findByPk(admissionForm.exam_id);
  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Validate form responses against form structure
  try {
    validateFormResponses(admissionForm.form_structure, form_responses);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, "VALIDATION_ERROR", error.message);
  }

  // For public submissions, we don't have a representative_id
  // We'll use a placeholder or null, and the admin can review these separately
  // Create submission with null representative_id to indicate public submission
  const submission = await AdmissionFormSubmission.create({
    exam_id: admissionForm.exam_id,
    representative_id: null, // Public submission, no representative
    form_responses,
    status: "PENDING",
  });

  return res.status(201).json(
    new ApiResponse("ADMISSION_FORM_SUBMITTED", {
      id: submission.id,
      exam_id: submission.exam_id,
      form_responses: submission.form_responses,
      status: submission.status,
      created_at: submission.created_at,
    })
  );
});
