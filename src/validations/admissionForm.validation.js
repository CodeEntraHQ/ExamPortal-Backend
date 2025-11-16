import { z } from "zod";

import {
  stringValidation,
  authorizationValidation,
  uuidValidation,
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
