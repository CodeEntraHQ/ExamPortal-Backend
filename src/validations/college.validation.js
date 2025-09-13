import { z } from "zod";

import { integerValidation, stringValidation } from "#validations/rules.js";

export const getCollegesSchema = z.object({
  query: z.object({
    page: z.optional(integerValidation("page", 1, null)),
    limit: z.optional(integerValidation("limit", 1, 10)),
  }),
});

export const createCollegeSchema = z.object({
  body: z.object({
    name: stringValidation("name"),
    address: stringValidation("address"),
  }),
});

export const updateCollegeSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      address: z.string().optional(),
    })
    .refine((data) => data.name !== undefined || data.address !== undefined, {
      message: "At least one of 'name' or 'address' is required.",
    }),
});
