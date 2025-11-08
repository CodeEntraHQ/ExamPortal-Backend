import { z } from "zod";

import { authorizationValidation, uuidValidation } from "#validations/rules.js";

export const startExamSchema = z.object({
  body: z
    .object({
      exam_id: uuidValidation("exam_id"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const saveAnswerSchema = z.object({
  body: z
    .object({
      exam_id: uuidValidation("exam_id"),
      question_id: uuidValidation("question_id"),
      answer: z.any(), // Can be string, array, number, etc.
    })
    .strict(),
  headers: authorizationValidation(),
});

export const submitExamSchema = z.object({
  body: z
    .object({
      exam_id: uuidValidation("exam_id"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const getSubmissionsSchema = z.object({
  query: z
    .object({
      exam_id: uuidValidation("exam_id"),
    })
    .strict(),
  headers: authorizationValidation(),
});
