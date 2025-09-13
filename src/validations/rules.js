import { z } from "zod";

export const integerValidation = (keyName, minValue, maxValue) => {
  let rule = z.coerce
    .number({
      error: `${keyName} must be a number`,
    })
    .int({
      error: `${keyName} must be an integer`,
    });
  if (minValue) {
    rule = rule.min(minValue, {
      error: `${keyName} must be greater than ${minValue}`,
    });
  }
  if (maxValue) {
    rule = rule.max(maxValue, {
      error: `${keyName} must be less than ${maxValue}`,
    });
  }
  return rule;
};

export const stringValidation = (keyName) =>
  z
    .string({
      error: `${keyName} is required`,
    })
    .transform((str) => str.trim())
    .refine((str) => str.length >= 1, {
      error: `${keyName} must have length greater than 1`,
    })
    .refine((str) => str.length <= 255, {
      error: `${keyName} must have length less than 255`,
    });

export const uuidValidation = (keyName) =>
  z
    .string({
      error: `${keyName} is required`,
    })
    .uuid({
      error: `${keyName} must be a valid UUID`,
    });

export const authorizationValidation = () =>
  z.object({
    authorization: z
      .string({
        error: "authorization header is required",
      })
      .regex(/^Bearer\s([A-Za-z0-9-_]+\.){2}[A-Za-z0-9-_]+$/, {
        error: "Invalid authorization header",
      }),
  });

export const emailValidation = () =>
  z
    .string({
      error: "email is required",
    })
    .email({
      error: "email must be a valid",
    });

export const arrayValidation = (keyName, itemSchema) =>
  z
    .array(itemSchema, {
      error: `Invalid ${keyName} array`,
    })
    .min(1, {
      error: `${keyName} must have size greater than 1`,
    });
