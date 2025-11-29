import bcrypt from "bcrypt";

import Media from "#models/media.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_STATUS } from "#utils/constants/model.constant.js";

export const registerUser = ApiHandler(async (req, res) => {
  // Parsing request
  const password = req.body.password?.trim();
  const name = req.body.name?.trim();
  const phone_number = req.body.phone_number
    ? typeof req.body.phone_number === "number"
      ? String(req.body.phone_number)
      : req.body.phone_number.trim()
    : null;
  const address = req.body.address?.trim();
  const bio = req.body.bio?.trim();
  const profile_picture = req.file;
  const gender = req.body.gender?.trim();
  const roll_number = req.body.roll_number?.trim();

  // Hashing Password
  const password_hash = await bcrypt.hash(password, 10);

  let media;
  if (profile_picture) {
    media = await Media.create({
      profile_picture,
    });
  }

  // Update user with password but keep status as ACTIVATION_PENDING
  // User will become ACTIVE on first successful login
  const updateData = {
    password_hash,
    status: USER_STATUS.ACTIVATION_PENDING,
  };

  // Only update fields that are provided
  if (name) updateData.name = name;
  if (phone_number) updateData.phone_number = phone_number;
  if (address) updateData.address = address;
  if (bio) updateData.bio = bio;
  if (media?.id) updateData.media_id = media.id;
  if (gender) updateData.gender = gender;
  if (roll_number) updateData.roll_number = roll_number;

  await req.user.update(updateData);

  // Send response
  return res.status(200).json(new ApiResponse("USER_REGISTERED"));
});
