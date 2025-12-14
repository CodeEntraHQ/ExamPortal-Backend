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
          instructions: z.array(z.string()),
        })
        .optional(),
      results_visible: z.boolean().optional(),
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
      type: z.enum(["MCQ_SINGLE", "MCQ_MULTIPLE", "SINGLE_WORD"]),
      metadata: z.any().optional(),
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
  params: z
    .object({
      id: uuidValidation("id"),
    })
    .strict(),
  body: z
    .object({
      entity_id: uuidValidation("entity_id"),
      student_emails: arrayValidation("student_emails", emailValidation()),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const inviteRepresentativesSchema = z.object({
  params: z
    .object({
      exam_id: uuidValidation("exam_id"),
    })
    .strict(),
  body: z
    .object({
      user_ids: arrayValidation("user_ids", uuidValidation("user_id")).min(1, {
        message: "At least one representative must be selected",
      }),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const updateQuestionSchema = z.object({
  params: z
    .object({
      id: uuidValidation("id"),
    })
    .strict(),
  body: z
    .object({
      question_text: stringValidation("question_text").optional(),
      type: z.enum(["MCQ_SINGLE", "MCQ_MULTIPLE", "SINGLE_WORD"]).optional(),
      metadata: z.any().optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const deleteQuestionSchema = z.object({
  params: z
    .object({
      id: uuidValidation("id"),
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
          instructions: z.array(z.string()).optional(),
          description: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
        .optional(),
      active: z.boolean().optional(),
      results_visible: z.boolean().optional(),
      monitoring_enabled: z.boolean().optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const getStudentEnrollmentsSchema = z.object({
  headers: authorizationValidation(),
});

export const getRepresentativeEnrollmentsSchema = z.object({
  headers: authorizationValidation(),
});

export const getExamByIdSchema = z.object({
  params: z
    .object({
      id: uuidValidation("id"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const getExamStatisticsSchema = z.object({
  query: z
    .object({
      entity_id: uuidValidation("entity_id").optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const getExamDetailStatisticsSchema = z.object({
  params: z
    .object({
      id: uuidValidation("id"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const getExamLeaderboardSchema = z.object({
  params: z
    .object({
      id: uuidValidation("id"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const getExamEnrollmentsSchema = z.object({
  params: z
    .object({
      id: uuidValidation("id"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const deleteExamEnrollmentSchema = z.object({
  params: z
    .object({
      id: uuidValidation("id"),
      enrollmentId: uuidValidation("enrollmentId"),
    })
    .strict(),
  headers: authorizationValidation(),
});
