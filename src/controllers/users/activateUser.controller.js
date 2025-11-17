import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_STATUS } from "#utils/constants/model.constant.js";

export const activateUser = ApiHandler(async (req, res) => {
  const user_id = req.body?.user_id?.trim();

  if (!user_id) {
    throw new ApiError(400, "BAD_REQUEST", "user_id is required");
  }

  // Find the user to activate
  const userToActivate = await User.findByPk(user_id);

  if (!userToActivate) {
    throw new ApiError(404, "USER_NOT_FOUND", "User to activate not found");
  }

  // Check permissions
  const requesterRole = req.user.role?.toUpperCase();
  const targetRole = userToActivate.role?.toUpperCase();

  const manageableRolesForSuperAdmin = ["ADMIN", "STUDENT", "REPRESENTATIVE"];
  const manageableRolesForAdmin = ["STUDENT", "REPRESENTATIVE"];

  const canActivate =
    (requesterRole === "SUPERADMIN" &&
      manageableRolesForSuperAdmin.includes(targetRole)) ||
    (requesterRole === "ADMIN" && manageableRolesForAdmin.includes(targetRole));

  if (!canActivate) {
    throw new ApiError(
      403,
      "AUTHORIZATION_FAILED",
      "User has insufficient permissions"
    );
  }

  if (userToActivate.status === USER_STATUS.ACTIVE) {
    throw new ApiError(409, "USER_IS_ACTIVE", "User is already active.");
  }

  // Activate the user
  userToActivate.status = USER_STATUS.ACTIVE;
  await userToActivate.save();

  return res.status(200).json(new ApiResponse("USER_ACTIVATED"));
});
