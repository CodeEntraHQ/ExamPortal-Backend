import { z } from "zod";

import {
  integerValidation,
  stringValidation,
  uuidValidation,
  authorizationValidation,
} from "#validations/rules.js";

export const getCollegesSchema = z.object({
  query: z
    .object({
      page: integerValidation("page", 1, null).optional(),
      limit: integerValidation("limit", 1, 10).optional(),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const createCollegeSchema = z.object({
  body: z
    .object({
      name: stringValidation("name"),
      address: stringValidation("address"),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const updateCollegeSchema = z.object({
  body: z
    .object({
      college_id: uuidValidation("college_id"),
      name: stringValidation("name").optional(),
      address: stringValidation("address").optional(),
    })
    .refine((data) => data.name !== undefined || data.address !== undefined, {
      message: "At least one of name or address is required",
    })
    .strict(),
  headers: authorizationValidation(),
});
