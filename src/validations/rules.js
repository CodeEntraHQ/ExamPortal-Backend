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

export const stringValidation = (keyName, minLength = 1, maxLength = 255) =>
  z
    .string({
      error: `${keyName} is required`,
    })
    .transform((str) => str.trim())
    .refine((str) => str.length >= minLength, {
      error: `${keyName} must have length greater than ${minLength}`,
    })
    .refine((str) => str.length <= maxLength, {
      error: `${keyName} must have length less than ${maxLength}`,
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

export const imageFileValidation = () =>
  z.object({
    originalname: z.string(),
    mimetype: z
      .string()
      .refine(
        (type) => ["image/jpeg", "image/png", "image/jpg"].includes(type),
        {
          error: "Only JPEG and PNG images are allowed",
        }
      ),
    size: z.number().max(5242880, { message: "File must be less than 5MB" }),
    buffer: z.instanceof(Buffer),
  });

/**
 * Validates image dimensions
 * @param {Buffer} imageBuffer - Image buffer
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @returns {Promise<{width: number, height: number}>} Image dimensions
 * @throws {Error} If dimensions exceed limits
 */
export const validateImageDimensions = async (
  imageBuffer,
  maxWidth = 1920,
  maxHeight = 1080
) => {
  // Dynamic import to avoid requiring sharp if not needed
  const sharp = await import("sharp");
  const metadata = await sharp.default(imageBuffer).metadata();

  if (metadata.width > maxWidth || metadata.height > maxHeight) {
    throw new Error(
      `Image dimensions (${metadata.width}x${metadata.height}) exceed maximum allowed (${maxWidth}x${maxHeight}px)`
    );
  }

  return { width: metadata.width, height: metadata.height };
};
