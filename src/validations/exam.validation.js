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
