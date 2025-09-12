import bcrypt from "bcrypt";

import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { generateUserSessionToken } from "#utils/crypto.util.js";

export const loginUser = ApiHandler(async (req, res) => {
  // Parsing request
  const { email, password } = req.body;

  // Request assertion
  if (
    [email, password].some((field) => !field || String(field).trim() === "")
  ) {
    throw new ApiError(400, "BAD_REQUEST", "email and password is required");
  }

  // Find user
  const user = await User.findOne({
    where: {
      email: email,
      status: "ACTIVE",
    },
  });

  if (!user) {
    throw new ApiError(401, "AUTHENTICATION_FAILED", "User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new ApiError(401, "AUTHENTICATION_FAILED", "Invalid credentials");
  }

  // Generate session token
  const token = generateUserSessionToken(user.id);

  // Send response
  return res.status(200).json(
    new ApiResponse("LOGIN_SUCCESSFUL", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  );
});
