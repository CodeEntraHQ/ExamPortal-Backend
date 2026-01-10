import { z } from "zod";

import { ENTITY_TYPE } from "#utils/constants/model.constant.js";

import {
  stringValidation,
  emailValidation,
  integerValidation,
} from "./rules.js";

export const createTrialEntitySchema = z.object({
  body: z
    .object({
      name: stringValidation("name"),
      address: stringValidation("address").optional(),
      type: z.enum([...Object.values(ENTITY_TYPE)]).optional(),
      description: stringValidation("description").optional(),
      email: emailValidation().optional(),
      phone_number: integerValidation(
        "phone_number",
        6000000000,
        9999999999
      ).optional(),
      admin_email: emailValidation(),
    })
    .strict(),
  // Files are in req.files with multer fields, so we don't validate them here
  // Validation happens in the controller where we access req.files?.logo?.[0]
  // No authentication required for trial entity creation (no headers validation)
});
