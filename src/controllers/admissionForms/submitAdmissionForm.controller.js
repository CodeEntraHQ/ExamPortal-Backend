import AdmissionForm from "#models/admissionForm.model.js";
import AdmissionFormSubmission from "#models/admissionFormSubmission.model.js";
import Enrollment from "#models/enrollment.model.js";
import Exam from "#models/exam.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import {
  ENROLLMENT_STATUS,
  USER_ROLES,
} from "#utils/constants/model.constant.js";

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
      // Phone validation: should be numeric and reasonable length
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
      // Check min/max if defined
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
      // Validate date format (YYYY-MM-DD)
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
      // Basic string validation
      if (typeof value !== "string") {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          `${field.label} must be a string`
        );
      }
      // Check pattern if defined
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
      // For unknown types, just check it's not empty if required
      break;
  }
};

/**
 * Validates form responses against form structure
 */
const validateFormResponses = (formStructure, formResponses) => {
  // Create a map of fields by label and id for easy lookup
  const fieldMap = new Map();
  formStructure.forEach((field) => {
    const key = field.id || field.label;
    fieldMap.set(key, field);
    // Also map by label for backward compatibility
    if (field.id) {
      fieldMap.set(field.label, field);
    }
  });

  // Validate all fields in form structure
  for (const field of formStructure) {
    const fieldKey = field.id || field.label;
    const responseValue = formResponses[fieldKey] ?? formResponses[field.label];

    validateFieldResponse(field, responseValue);
  }

  // Check for extra fields that don't exist in form structure
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

export const submitAdmissionForm = ApiHandler(async (req, res) => {
  const { exam_id } = req.params;
  const { form_responses } = req.body;

  // Check if user is a representative
  if (req.user.role !== USER_ROLES.REPRESENTATIVE) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only representatives can submit admission forms"
    );
  }

  // Check if exam exists
  const exam = await Exam.findByPk(exam_id);
  if (!exam) {
    throw new ApiError(404, "NOT_FOUND", "Exam not found");
  }

  // Check if representative has access to this exam (has ASSIGNED enrollment)
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
      "You don't have access to submit admission forms for this exam"
    );
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

  // Validate form responses against form structure
  try {
    validateFormResponses(admissionForm.form_structure, form_responses);
  } catch (error) {
    // Re-throw ApiError as-is, otherwise wrap it
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, "VALIDATION_ERROR", error.message);
  }

  // Create submission
  const submission = await AdmissionFormSubmission.create({
    exam_id,
    representative_id: req.user.id,
    form_responses,
    status: "PENDING", // Default status
  });

  return res.status(201).json(
    new ApiResponse("ADMISSION_FORM_SUBMITTED", {
      id: submission.id,
      exam_id: submission.exam_id,
      representative_id: submission.representative_id,
      form_responses: submission.form_responses,
      status: submission.status,
      created_at: submission.created_at,
    })
  );
});
