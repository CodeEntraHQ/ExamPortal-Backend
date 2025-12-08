import { z } from "zod";

import {
  stringValidation,
  authorizationValidation,
  uuidValidation,
  integerValidation,
} from "#validations/rules.js";

// Field type enum
const fieldTypeEnum = z.enum(
  ["TEXT", "NUMBER", "EMAIL", "PHONE", "GENDER", "DATE", "TEXTAREA"],
  {
    errorMap: () => ({
      message:
        "Field type must be one of: TEXT, NUMBER, EMAIL, PHONE, GENDER, DATE, TEXTAREA",
    }),
  }
);

// Field definition schema
const fieldDefinitionSchema = z.object({
  id: z.string().optional(), // For frontend to track fields
  label: stringValidation("field label", 1, 255),
  type: fieldTypeEnum,
  required: z.boolean().optional().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(), // For select/dropdown fields
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
});

export const createAdmissionFormSchema = z.object({
  params: z
    .object({
      exam_id: uuidValidation("exam_id"),
    })
    .strict(),
  body: z
    .object({
      form_structure: z.array(fieldDefinitionSchema).min(1, {
        message: "form_structure must contain at least one field",
      }),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const getAdmissionFormSchema = z.object({
  params: z
    .object({
      exam_id: uuidValidation("exam_id"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const updateAdmissionFormSchema = z.object({
  params: z
    .object({
      exam_id: uuidValidation("exam_id"),
    })
    .strict(),
  body: z
    .object({
      form_structure: z.array(fieldDefinitionSchema).min(1, {
        message: "form_structure must contain at least one field",
      }),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const submitAdmissionFormSchema = z.object({
  params: z
    .object({
      exam_id: uuidValidation("exam_id"),
    })
    .strict(),
  body: z
    .object({
      form_responses: z
        .record(z.string(), z.any(), {
          error: "form_responses must be an object",
        })
        .refine((obj) => Object.keys(obj).length > 0, {
          message: "form_responses must contain at least one field",
        }),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const getAdmissionFormSubmissionsSchema = z.object({
  query: z
    .object({
      page: integerValidation("page", 1, null).optional(),
      limit: integerValidation("limit", 1, 10).optional(),
      entity_id: uuidValidation("entity_id").optional(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const updateSubmissionStatusSchema = z.object({
  params: z
    .object({
      submission_id: uuidValidation("submission_id"),
    })
    .strict(),
  body: z
    .object({
      action: z.enum(["approve", "reject"], {
        errorMap: () => ({
          message: "action must be either 'approve' or 'reject'",
        }),
      }),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});
