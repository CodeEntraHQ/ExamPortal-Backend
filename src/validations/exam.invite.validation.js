import Joi from "joi";

export const examInviteValidation = {
  body: Joi.object({
    examId: Joi.string().required(),
    entityId: Joi.string().required(),
    emails: Joi.array().items(Joi.string().email()).min(1).required().messages({
      "array.min": "At least one email address is required",
      "string.email": "Invalid email address format",
    }),
  }),
};
