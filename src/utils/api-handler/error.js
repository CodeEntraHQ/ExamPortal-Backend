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
    this.data = null;
    this.message = message;
    this.success = false;

    logError({
      action: statusCode + "-" + this.message,
      message: description || this.message,
    });

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
