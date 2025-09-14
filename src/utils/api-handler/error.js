import { logError } from "../logger.js";

export class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", description) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.description = description;

    logError({
      action: statusCode + "-" + message,
      message: description || message,
    });

    Error.captureStackTrace(this, this.constructor);
  }
}
