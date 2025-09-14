import { z } from "zod";

import {
  emailValidation,
  stringValidation,
  uuidValidation,
  authorizationValidation,
  integerValidation,
} from "#validations/rules.js";

export const loginUserSchema = z.object({
  body: z
    .object({
      email: emailValidation(),
      password: stringValidation("password"),
    })
    .strict(),
});

export const forgotPasswordSchema = z.object({
  body: z
    .object({
      email: emailValidation(),
    })
    .strict(),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      password: stringValidation("password"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const renewLoginSchema = z.object({
  headers: authorizationValidation(),
});

export const getUsersSchema = z.object({
  query: z
    .object({
      college_id: uuidValidation("college_id"),
      role: z.enum(["ADMIN", "STUDENT"]),
      page: integerValidation("page", 1, null).optional(),
      limit: integerValidation("limit", 1, 10).optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const deregisterUserSchema = z.object({
  body: z
    .object({
      user_id: uuidValidation("user_id").optional(),
    })
    .strict()
    .optional(),
  headers: authorizationValidation(),
});

export const inviteUserSchema = z.object({
  body: z
    .object({
      email: emailValidation(),
      role: z.enum(["ADMIN", "STUDENT"]),
      college_id: uuidValidation("college_id").optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const registerUserSchema = z.object({
  body: z
    .object({
      name: stringValidation("name"),
      password: stringValidation("password"),
    })
    .strict(),
  headers: authorizationValidation(),
});
