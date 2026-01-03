import { z } from "zod";

import { ENTITY_TYPE } from "#utils/constants/model.constant.js";
import {
  integerValidation,
  stringValidation,
  uuidValidation,
  authorizationValidation,
  emailValidation,
  imageFileValidation,
} from "#validations/rules.js";

export const getEntitiesSchema = z.object({
  query: z
    .object({
      page: integerValidation("page", 1, null).optional(),
      limit: integerValidation("limit", 1, 10).optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const createEntitySchema = z.object({
  body: z
    .object({
      address: stringValidation("address"),
      description: stringValidation("description").optional(),
      email: emailValidation("email").optional(),
      name: stringValidation("name"),
      phone_number: integerValidation(
        "phone_number",
        6000000000,
        9999999999
      ).optional(),
      type: z.enum([...Object.values(ENTITY_TYPE)]),
      subscription_years: integerValidation("subscription_years", 0).optional(),
      subscription_months: integerValidation(
        "subscription_months",
        0
      ).optional(),
      subscription_days: integerValidation("subscription_days", 0).optional(),
    })
    .strict(),
  file: imageFileValidation().optional(),
  headers: authorizationValidation(),
});

export const updateEntitySchema = z.object({
  body: z
    .object({
      entity_id: uuidValidation("entity_id"),
      address: stringValidation("address").optional(),
      description: stringValidation("description").optional(),
      email: emailValidation("email").optional(),
      name: stringValidation("name").optional(),
      phone_number: integerValidation(
        "phone_number",
        6000000000,
        9999999999
      ).optional(),
      type: z.enum([...Object.values(ENTITY_TYPE)]).optional(),
      monitoring_enabled: z.union([z.boolean(), z.string()]).optional(),
      subscription_years: integerValidation("subscription_years", 0).optional(),
      subscription_months: integerValidation(
        "subscription_months",
        0
      ).optional(),
      subscription_days: integerValidation("subscription_days", 0).optional(),
    })
    .refine(
      (data) =>
        data.address !== undefined ||
        data.description !== undefined ||
        data.email !== undefined ||
        data.name !== undefined ||
        data.phone_number !== undefined ||
        data.type !== undefined ||
        data.monitoring_enabled !== undefined ||
        data.subscription_years !== undefined ||
        data.subscription_months !== undefined ||
        data.subscription_days !== undefined,
      {
        message: "At least one of attribute is required",
      }
    )
    .strict(),
  file: imageFileValidation().optional(),
  headers: authorizationValidation(),
});
