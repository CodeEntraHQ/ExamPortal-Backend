import { ApiError } from "#utils/api-handler/error.js";

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "FAILURE",
      responseMsg: err.message,
    });
  }

  return res.status(500).json({
    status: "FAILURE",
    responseMsg: "INTERNAL_SERVER_ERROR",
  });
};

export { errorHandler };
