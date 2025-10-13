import bcrypt from "bcrypt";

import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const changePassword = ApiHandler(async (req, res) => {
  const currentPassword = req.body.currentPassword?.trim();
  const newPassword = req.body.newPassword?.trim();

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    req.user.password_hash
  );

  if (!isPasswordCorrect) {
    throw new ApiError(
      400,
      "INCORRECT_PASSWORD",
      "The current password you entered is incorrect."
    );
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await req.user.update({ password_hash: hashedNewPassword });

  return res.status(200).json(new ApiResponse("PASSWORD_CHANGE_SUCCESSFUL"));
});
