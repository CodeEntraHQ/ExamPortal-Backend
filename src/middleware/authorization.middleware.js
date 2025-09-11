import { ApiError } from "#utils/api-handler/error.js";

export const checkAuthorization =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "AUTHORIZATION_FAILED",
        "User has insufficient permissions"
      );
    }
    next();
  };
