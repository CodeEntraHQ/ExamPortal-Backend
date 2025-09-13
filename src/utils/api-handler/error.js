import { logError } from "../logger.js";

export class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    description,
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.description = description;

    logError({
      action: statusCode + "-" + message,
      message: description || message,
    });

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
