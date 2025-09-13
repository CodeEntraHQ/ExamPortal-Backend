import { z } from "zod";

const integerValidation = (keyName, minValue, maxValue) => {
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

const stringValidation = (keyName) => {
  let rule = z
    .string()
    .min(1, {
      error: `${keyName} must have length greater than 1`,
    })
    .max(255, {
      error: `${keyName} must have length less than 255`,
    });
  return rule;
};

export { integerValidation, stringValidation };
