import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiError } from "#utils/api-handler/error.js";
import bcrypt from "bcrypt";

export const resetPassword = ApiHandler(async (req, res) => {
  const { password } = req.body || {};

  if (!password) {
    throw new ApiError(400, "BAD_REQUEST", "Password is required");
  }

  // Hashing Password
  const password_hash = await bcrypt.hash(password, 10);

  req.user.password_hash = password_hash;
  await req.user.save();

  // Send response
  return res.status(200).json(new ApiResponse("RESET_PASSWORD_SUCCESSFUL"));
});
