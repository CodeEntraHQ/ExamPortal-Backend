import bcrypt from "bcrypt";

import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const changePassword = ApiHandler(async (req, res) => {
  const oldPassword = req.body.oldPassword?.trim();
  const newPassword = req.body.newPassword?.trim();

  const isPasswordCorrect = await bcrypt.compare(
    oldPassword,
    req.user.password_hash
  );

  if (!isPasswordCorrect) {
    throw new ApiError(
      401,
      "INCORRECT_PASSWORD",
      "The old password you entered is incorrect. Please try again"
    );
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await req.user.update({ password_hash: hashedNewPassword });

  return res.status(200).json(new ApiResponse("PASSWORD_CHANGE_SUCCESSFUL"));
});
