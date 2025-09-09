import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import bcrypt from "bcrypt";
import asyncLocalStorage from "#utils/context.js";
import jwt from "jsonwebtoken";

export const loginUser = ApiHandler(async (req, res) => {
  // Parsing request
  const { email, password } = req.body;

  // Request assertion
  if (
    [email, password].some((field) => !field || String(field).trim() === "")
  ) {
    throw new ApiError(
      400,
      "AUTHENTICATION_FAILED",
      "email and password is required"
    );
  }

  // Find user
  const user = await User.findOne({
    where: {
      email: email,
      status: "ACTIVE",
    },
  });

  if (!user) {
    throw new ApiError(400, "AUTHENTICATION_FAILED", "User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new ApiError(400, "AUTHENTICATION_FAILED", "Invalid credentials");
  }

  // Generate session token
  const token = generateAccessToken(user.id, user.email);

  // Send response
  return res.status(200).json(
    new ApiResponse("LOGIN_SUCCESSFUL", {
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  );
});

const generateAccessToken = (user_id, email) => {
  const { session_id } = asyncLocalStorage.getStore();
  return jwt.sign({ user_id, email, session_id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};
