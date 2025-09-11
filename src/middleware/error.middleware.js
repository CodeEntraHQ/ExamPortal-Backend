import { ApiError } from "#utils/api-handler/error.js";

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "FAILURE",
      responseCode: err.message,
      responseMessage: err.description,
    });
  }

  return res.status(500).json({
    status: "FAILURE",
    responseCode: "INTERNAL_SERVER_ERROR",
    responseMessage: "Something went wrong",
  });
};

export { errorHandler };
