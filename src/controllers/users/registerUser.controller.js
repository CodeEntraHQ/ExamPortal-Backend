import bcrypt from "bcrypt";

import Media from "#models/media.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_STATUS } from "#utils/constants/model.constant.js";

export const registerUser = ApiHandler(async (req, res) => {
  // Parsing request
  const name = req.body.name?.trim();
  const password = req.body.password?.trim();
  const phone_number = req.body.phone_number?.trim();
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

  // Create user
  await req.user.update({
    name,
    password_hash,
    status: USER_STATUS.ACTIVE,
    phone_number,
    address,
    bio,
    media_id: media?.id,
    gender,
    roll_number,
  });

  // Send response
  return res.status(200).json(new ApiResponse("USER_REGISTERED"));
});
