import bcrypt from "bcrypt";

import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { generateUserSessionToken } from "#utils/crypto.util.js";

export const loginUser = ApiHandler(async (req, res) => {
  // Parsing request
  const password = req.body.password?.trim();
  const captcha = req.body.captcha?.trim();

  const passwordMatch = await bcrypt.compare(password, req.user.password_hash);
  const captchaMatch = await bcrypt.compare(captcha, req.captcha);

  if (!captchaMatch) {
    throw new ApiError(
      401,
      "AUTHENTICATION_FAILED",
      "Captcha verification failed. Please try again"
    );
  }
  if (!passwordMatch) {
    throw new ApiError(
      401,
      "AUTHENTICATION_FAILED",
      "Password verification failed. Please try again"
    );
  }

  // Generate session token
  const token = generateUserSessionToken(req.user.id);

  // Send response
  return res.status(200).json(
    new ApiResponse("LOGIN_SUCCESSFUL", {
      token,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profile_picture: req.user.profile_picture,
        created_at: req.user.created_at,
      },
    })
  );
});
