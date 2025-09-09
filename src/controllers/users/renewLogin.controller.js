import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import asyncLocalStorage from "#utils/context.js";
import jwt from "jsonwebtoken";

export const renewLogin = ApiHandler(async (req, res) => {
  // Generate session token
  const token = generateAccessToken(req.user.id, req.user.email);

  // Send response
  return res.status(200).json(
    new ApiResponse("RENEW_SUCCESSFUL", {
      token,
    })
  );
});

const generateAccessToken = (user_id, email) => {
  const { session_id } = asyncLocalStorage.getStore();
  return jwt.sign({ user_id, email, session_id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};
