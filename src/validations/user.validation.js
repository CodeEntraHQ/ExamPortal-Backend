import { z } from "zod";

import { TWO_FA_TOGGLE_MODE } from "#utils/constants/meta.constant.js";
import { USER_GENDER, USER_ROLES } from "#utils/constants/model.constant.js";
import {
  emailValidation,
  stringValidation,
  uuidValidation,
  authorizationValidation,
  integerValidation,
  imageFileValidation,
} from "#validations/rules.js";

export const loginUserSchema = z.object({
  body: z
    .object({
      email: emailValidation(),
      password: stringValidation("password"),
      authentication_code: stringValidation(
        "authentication_code",
        6,
        6
      ).optional(),
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
      entity_id: uuidValidation("entity_id"),
      role: z.enum([USER_ROLES.ADMIN, USER_ROLES.STUDENT]),
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
      role: z.enum([USER_ROLES.ADMIN, USER_ROLES.STUDENT]),
      entity_id: uuidValidation("entity_id").optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const registerUserSchema = z.object({
  body: z
    .object({
      name: stringValidation("name"),
      password: stringValidation("password"),
      phone_number: integerValidation("phone_number", 6000000000, 9999999999),
      address: stringValidation("address").optional(),
      bio: stringValidation("bio").optional(),
      gender: z.enum([...Object.values(USER_GENDER)]).optional(),
      roll_number: stringValidation("roll_number").optional(),
    })
    .strict(),
  file: imageFileValidation().optional(),
  headers: authorizationValidation(),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: stringValidation("currentPassword"),
      newPassword: stringValidation("newPassword"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const updateUserSchema = z.object({
  body: z
    .object({
      name: stringValidation("name").optional(),
      phone_number: integerValidation(
        "phone_number",
        6000000000,
        9999999999
      ).optional(),
      address: stringValidation("address").optional(),
      bio: stringValidation("bio").optional(),
      gender: z.enum([...Object.values(USER_GENDER)]).optional(),
      roll_number: stringValidation("roll_number").optional(),
    })
    .strict(),
  file: imageFileValidation().optional(),
  headers: authorizationValidation(),
});

export const generateTwoFaSchema = z.object({
  headers: authorizationValidation(),
});

export const toggleTwoFaSchema = z.object({
  body: z
    .object({
      mode: z.enum([...Object.values(TWO_FA_TOGGLE_MODE)]),
      authentication_code: stringValidation("authentication_code", 6, 6),
    })
    .strict(),
  headers: authorizationValidation(),
});
