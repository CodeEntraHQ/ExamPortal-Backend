import bcrypt from "bcrypt";

import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_STATUS } from "#utils/constants/model.constant.js";
import { generateUserSessionToken } from "#utils/crypto.util.js";
import { constructMediaLink } from "#utils/utils.js";

export const loginUser = ApiHandler(async (req, res) => {
  // Parsing request
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();

  const user = await User.findOne({
    where: {
      email: email,
      status: USER_STATUS.ACTIVE,
    },
  });

  if (!user) {
    throw new ApiError(401, "AUTHENTICATION_FAILED", "User not found");
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new ApiError(
      401,
      "AUTHENTICATION_FAILED",
      "Password verification failed"
    );
  }

  const token = generateUserSessionToken(user.id);

  // Send response
  return res.status(200).json(
    new ApiResponse("LOGIN_SUCCESSFUL", {
      token,
      user: {
        id: user.id,
        address: user.address,
        bio: user.bio,
        created_at: user.created_at,
        email: user.email,
        name: user.name,
        phone_number: user.phone_number,
        profile_picture_link: constructMediaLink(user.profile_picture_id),
        role: user.role,
        status: user.status,
      },
    })
  );
});
