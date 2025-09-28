import { z } from "zod";

import { ENTITY_TYPE } from "#utils/constants/model.constant.js";
import {
  integerValidation,
  stringValidation,
  uuidValidation,
  authorizationValidation,
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
      name: stringValidation("name"),
      address: stringValidation("address"),
      type: z.enum([...Object.values(ENTITY_TYPE)]),
    })
    .strict(),
  headers: authorizationValidation(),
});

export const updateEntitySchema = z.object({
  body: z
    .object({
      entity_id: uuidValidation("entity_id"),
      name: stringValidation("name").optional(),
      address: stringValidation("address").optional(),
      type: z.enum([...Object.values(ENTITY_TYPE)]).optional(),
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.address !== undefined ||
        data.type !== undefined,
      {
        message: "At least one of name address or type is required",
      }
    )
    .strict(),
  headers: authorizationValidation(),
});
