import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const deleteUser = ApiHandler(async (req, res) => {
  const user_id = req.params?.user_id?.trim();

  if (!user_id) {
    throw new ApiError(400, "BAD_REQUEST", "user_id parameter is required");
  }

  if (req.user.role === "STUDENT") {
    throw new ApiError(
      403,
      "AUTHORIZATION_FAILED",
      "User has insufficient permissions"
    );
  }

  if (req.user.id === user_id) {
    throw new ApiError(
      400,
      "OPERATION_NOT_ALLOWED",
      "Users cannot delete themselves"
    );
  }

  const userToDelete = await User.findByPk(user_id);

  if (!userToDelete) {
    throw new ApiError(404, "USER_NOT_FOUND", "User to delete not found");
  }

  if (userToDelete.role === "SUPERADMIN") {
    throw new ApiError(
      403,
      "AUTHORIZATION_FAILED",
      "SUPERADMIN accounts cannot be deleted"
    );
  }

  const canDelete =
    (req.user.role === "SUPERADMIN" &&
      ["ADMIN", "STUDENT", "REPRESENTATIVE"].includes(userToDelete.role)) ||
    (req.user.role === "ADMIN" &&
      ["STUDENT", "REPRESENTATIVE"].includes(userToDelete.role));

  if (!canDelete) {
    throw new ApiError(
      403,
      "AUTHORIZATION_FAILED",
      "User has insufficient permissions"
    );
  }

  await userToDelete.destroy();

  return res.status(200).json(new ApiResponse("USER_DELETED"));
});
