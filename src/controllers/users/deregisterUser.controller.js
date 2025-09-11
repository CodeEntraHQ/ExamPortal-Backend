import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiHandler } from "#utils/api-handler/handler.js";

export const deregisterUser = ApiHandler(async (req, res) => {
  const { user_id } = req.body || {};

  let userToDeactivate;

  // Flow: Deactivating oneself
  if (!user_id) {
    if (req.user.role === "SUPERADMIN") {
      throw new ApiError(
        403,
        "AUTHORIZATION_FAILED",
        "User has insufficient permissions"
      );
    }
    userToDeactivate = req.user;
  }
  // Flow: Deactivating another user
  else {
    // Rule: Students cannot deactivate others.
    if (req.user.role === "STUDENT") {
      throw new ApiError(
        403,
        "AUTHORIZATION_FAILED",
        "User has insufficient permissions"
      );
    }

    userToDeactivate = await User.findByPk(user_id);

    if (!userToDeactivate) {
      throw new ApiError(
        404,
        "USER_NOT_FOUND",
        "User to deactivate not found."
      );
    }

    // Rule: Check permissions for deactivation.
    const canDeactivate =
      (req.user.role === "SUPERADMIN" &&
        ["ADMIN", "STUDENT"].includes(userToDeactivate.role)) ||
      (req.user.role === "ADMIN" && userToDeactivate.role === "STUDENT");

    if (!canDeactivate) {
      throw new ApiError(
        403,
        "AUTHORIZATION_FAILED",
        "User has insufficient permissions"
      );
    }
  }

  if (userToDeactivate.status === "INACTIVE") {
    throw new ApiError(409, "USER_IS_INACTIVE", "User is already inactive.");
  }
  userToDeactivate.status = "INACTIVE";
  await userToDeactivate.save();

  return res.status(200).json(new ApiResponse("USER_DEREGISTERED"));
});
