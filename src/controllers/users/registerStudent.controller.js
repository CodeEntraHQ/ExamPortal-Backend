import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import bcrypt from "bcrypt";

export const registerStudent = ApiHandler(async (req, res) => {
  // Parsing request
  const { name, email, password } = req.body;

  // Validate all fields
  if (
    [name, email, password].some(
      (field) => !field || String(field).trim() === ""
    )
  ) {
    throw new ApiError(400, "BAD_REQUEST", "Missing required fields");
  }

  // Check for duplicate email
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    throw new ApiError(409, "USER_ALREADY_EXISTS", "User already exists");
  }

  // Hashing Password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    password_hash,
    role: "STUDENT",
    active: true,
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("STUDENT_REGISTERED", {
      id: user.id,
      role: user.role,
    })
  );
});
