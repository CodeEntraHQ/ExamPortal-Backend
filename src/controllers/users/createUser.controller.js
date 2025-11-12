import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_STATUS } from "#utils/constants/model.constant.js";
import { generateUUID } from "#utils/utils.js";

/**
 * Generate a random password
 */
const generateRandomPassword = () => {
  // Generate a random password with 12 characters
  // Mix of uppercase, lowercase, numbers, and special characters
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(crypto.randomInt(0, charset.length));
  }
  return password;
};

export const createUser = ApiHandler(async (req, res) => {
  // Parsing request
  const email = req.body.email?.trim();
  const name = req.body.name?.trim();
  const role = req.body.role?.trim();
  const entity_id = req.body.entity_id?.trim();
  // Phone number can be a number (after validation coercion) or string, convert to string for storage
  const phone_number = req.body.phone_number
    ? typeof req.body.phone_number === "number"
      ? String(req.body.phone_number)
      : req.body.phone_number.trim()
    : null;
  const address = req.body.address?.trim();
  const bio = req.body.bio?.trim();
  const gender = req.body.gender?.trim();
  const roll_number = req.body.roll_number?.trim();

  // Authorization checks
  const inviterRole = req.user.role;
  if (
    role === "SUPERADMIN" ||
    (role === "ADMIN" && inviterRole !== "SUPERADMIN") ||
    (role === "STUDENT" && !["ADMIN", "SUPERADMIN"].includes(inviterRole)) ||
    inviterRole === "STUDENT"
  ) {
    throw new ApiError(
      403,
      "AUTHORIZATION_FAILED",
      "User creation hierarchy violated"
    );
  }

  if (inviterRole === "SUPERADMIN" && !entity_id) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "entity_id is required for SUPERADMIN"
    );
  }

  const resolvedEntityId = entity_id || req.user.entity_id;

  // Check for duplicate email
  const existingUser = await User.findOne({
    where: { email: email },
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "USER_EXISTS",
      "User with this email already exists"
    );
  }

  // Generate random password
  const randomPassword = generateRandomPassword();
  const password_hash = await bcrypt.hash(randomPassword, 10);

  // Create user
  const user_id = generateUUID();
  const user = await User.create({
    id: user_id,
    name: name || null,
    email: email,
    password_hash,
    role: role,
    status: USER_STATUS.ACTIVE, // Create as active directly
    entity_id: resolvedEntityId,
    phone_number: phone_number || null,
    address: address || null,
    bio: bio || null,
    gender: gender || null,
    roll_number: roll_number || null,
  });

  // Send response with generated password (for now, we'll send it via email later)
  return res.status(200).json(
    new ApiResponse("USER_CREATED", {
      id: user.id,
      email: user.email,
      role: user.role,
      // Note: In production, don't send password in response
      // Password will be sent via email separately
      password: randomPassword,
    })
  );
});
