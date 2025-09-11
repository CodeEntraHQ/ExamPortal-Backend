import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiError } from "#utils/api-handler/error.js";
import User from "#models/user.model.js";
import { sendPasswordResetEmail } from "#utils/email-handler/triggerEmail.js";
import { getResetPasswordLink } from "#utils/crypto.util.js";

export const forgotPassword = ApiHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "BAD_REQUEST", "Email is required");
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new ApiError(400, "BAD_REQUEST", "User not found");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(400, "USER_INACTIVE", "User is not in active state");
  }

  const passwordResetLink = getResetPasswordLink(user.id);
  const emailSent = await sendPasswordResetEmail(
    user.email,
    user.name,
    passwordResetLink
  );
  if (emailSent) {
    // Send response
    return res.status(200).json(new ApiResponse("RESET_PASSWORD_INITIATED"));
  } else {
    throw new ApiError(
      500,
      "SEND_EMAIL_FAILURE",
      "Unable to send password reset email"
    );
  }
});
