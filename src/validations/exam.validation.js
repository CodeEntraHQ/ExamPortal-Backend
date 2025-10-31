import { z } from "zod";

import {
  stringValidation,
  authorizationValidation,
  integerValidation,
  uuidValidation,
  arrayValidation,
  emailValidation,
} from "#validations/rules.js";

export const createExamSchema = z.object({
  body: z
    .object({
      title: stringValidation("title"),
      type: stringValidation("type"),
      duration_seconds: z.number().min(0),
      metadata: z
        .object({
          totalMarks: z.number().min(0),
          passingMarks: z.number().min(0),
          instructions: z.string(),
        })
        .optional(),
      entity_id: uuidValidation("entity_id").optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const getExamsSchema = z.object({
  query: z
    .object({
      page: integerValidation("page", 1, null).optional(),
      limit: integerValidation("limit", 1, 10).optional(),
      entity_id: uuidValidation("entity_id").optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const createQuestionSchema = z.object({
  body: z
    .object({
      exam_id: uuidValidation("exam_id"),
      question_text: stringValidation("question_text"),
      type: z.enum(["MCQ"]),
      metadata: z.any(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const getQuestionsSchema = z.object({
  query: z
    .object({
      exam_id: uuidValidation("exam_id"),
      page: integerValidation("page", 1, null).optional(),
      limit: integerValidation("limit", 1, 10).optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const inviteStudentSchema = z.object({
  body: z
    .object({
      exam_id: uuidValidation("exam_id"),
      student_emails: arrayValidation("student_emails", emailValidation()),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const updateExamSchema = z.object({
  params: z
    .object({
      id: uuidValidation("id"),
    })
    .strict(),
  body: z
    .object({
      title: stringValidation("title").optional(),
      type: stringValidation("type").optional(),
      duration_seconds: z.number().min(0).optional(),
      metadata: z
        .object({
          totalMarks: z.number().min(0).optional(),
          passingMarks: z.number().min(0).optional(),
          instructions: z.string().optional(),
          description: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
        .optional(),
      active: z.boolean().optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});
