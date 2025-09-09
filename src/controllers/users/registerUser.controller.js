import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import bcrypt from "bcrypt";

export const registerUser = ApiHandler(async (req, res) => {
  // Parsing request
  const { name, password } = req.body;

  // Request assertion
  if ([name, password].some((field) => !field || String(field).trim() === "")) {
    throw new ApiError(400, "BAD_REQUEST", "Missing required fields");
  }

  // Hashing Password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user
  const user = await req.user.update({
    name,
    password_hash,
    status: "ACTIVE",
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("USER_REGISTERED", {
      id: user.id,
      role: user.role,
    })
  );
});
