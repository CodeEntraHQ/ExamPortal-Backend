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

export const logoutUserSchema = z.object({
  headers: authorizationValidation(),
});

export const getUsersSchema = z.object({
  query: z
    .object({
      entity_id: uuidValidation("entity_id").optional(),
      role: z.enum([
        USER_ROLES.ADMIN,
        USER_ROLES.STUDENT,
        USER_ROLES.REPRESENTATIVE,
      ]),
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

export const deleteUserSchema = z.object({
  params: z
    .object({
      user_id: uuidValidation("user_id"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const activateUserSchema = z.object({
  body: z
    .object({
      user_id: uuidValidation("user_id"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const createUserSchema = z.object({
  body: z
    .object({
      email: emailValidation(),
      name: stringValidation("name").optional(),
      role: z.enum([
        USER_ROLES.ADMIN,
        USER_ROLES.STUDENT,
        USER_ROLES.REPRESENTATIVE,
      ]),
      entity_id: uuidValidation("entity_id").optional(),
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
    .strict()
    .refine(
      (data) =>
        data.role !== USER_ROLES.STUDENT || Boolean(data.roll_number?.trim()),
      {
        message: "roll_number is required for students",
        path: ["roll_number"],
      }
    ),
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
      password: stringValidation("password"),
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
