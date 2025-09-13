import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";

export const validate = (schema) =>
  ApiHandler((req, res, next) => {
    try {
      schema.parse(req);
      next();
    } catch (error) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        error.issues[0].message.replace(/"([^"]+)"/g, "$1")
      );
    }
  });
