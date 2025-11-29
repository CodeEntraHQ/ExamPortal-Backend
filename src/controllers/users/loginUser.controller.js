import bcrypt from "bcrypt";
import { Op } from "sequelize";
import speakeasy from "speakeasy";

import Entity from "#models/entity.model.js";
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
  const authentication_code = req.body.authentication_code?.trim();

  // Allow both ACTIVE and ACTIVATION_PENDING users to login
  // ACTIVATION_PENDING users must have a password set (from registration)
  const user = await User.findOne({
    where: {
      email: email,
      status: { [Op.in]: [USER_STATUS.ACTIVE, USER_STATUS.ACTIVATION_PENDING] },
    },
    include: [
      {
        model: Entity,
        attributes: ["id", "name"],
        required: false,
      },
    ],
  });

  if (!user) {
    throw new ApiError(401, "AUTHENTICATION_FAILED", "User not found");
  }

  // Check if user has a password set (required for login)
  if (!user.password_hash) {
    throw new ApiError(
      401,
      "AUTHENTICATION_FAILED",
      "Password not set. Please set your password first."
    );
  }

  if (!user.two_fa_enabled && authentication_code) {
    throw new ApiError(400, "BAD_REQUEST", "authentication_code not required");
  }

  if (user.two_fa_enabled && !authentication_code) {
    return res
      .status(200)
      .json(new ApiResponse("AUTHENTICATION_CODE_REQUIRED"));
  }

  const currentTime = new Date();
  const allowed_login_attempt = parseInt(process.env.FAILED_LOGIN_COUNT) || 3;
  const failed_login_freeze_time =
    parseInt(process.env.FAILED_LOGIN_FREEZE) || 1400; // minutes

  if (user.last_failed_login_at) {
    const last_failed_duration_ms =
      currentTime - new Date(user.last_failed_login_at);
    const last_failed_duration_min = last_failed_duration_ms / (1000 * 60);

    if (
      user.failed_login_count >= allowed_login_attempt &&
      last_failed_duration_min <= failed_login_freeze_time
    ) {
      const freezeRemaining = Math.max(
        failed_login_freeze_time - last_failed_duration_min,
        0
      );

      let errorMsg;
      if (freezeRemaining < 60) {
        errorMsg = `${Math.ceil(freezeRemaining)} minute(s)`;
      } else {
        const hours = (freezeRemaining / 60).toFixed(1);
        errorMsg = `${hours} hour(s)`;
      }

      throw new ApiError(
        401,
        "AUTHENTICATION_FAILED",
        `Too many failed attempts. Try again in ${errorMsg}.`
      );
    }
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (
    !passwordMatch ||
    (user.two_fa_enabled &&
      !verifyAuthenticationCode(authentication_code, user.two_fa_secret_key))
  ) {
    const updatedUser = await user.update({
      failed_login_count: user.failed_login_count + 1,
      last_failed_login_at: currentTime,
    });
    const remaining_limit =
      allowed_login_attempt - updatedUser.failed_login_count;
    throw new ApiError(
      401,
      "AUTHENTICATION_FAILED",
      `Authentication failed ${remaining_limit} attempts left`
    );
  }

  const token = generateUserSessionToken(user.id);

  // If user is ACTIVATION_PENDING, set them to ACTIVE on first successful login
  const updateData = {
    last_login_at: new Date(),
    failed_login_count: 0,
    last_failed_duration: null,
  };

  if (user.status === USER_STATUS.ACTIVATION_PENDING) {
    updateData.status = USER_STATUS.ACTIVE;
  }

  await user.update(updateData);

  // Reload user with Entity association to get entity information
  const updatedUser = await User.findByPk(user.id, {
    include: [
      {
        model: Entity,
        attributes: ["id", "name"],
        required: false,
      },
    ],
  });

  // Get entity information if available
  let entityId = null;
  let entityName = null;
  if (updatedUser?.Entity) {
    entityId = updatedUser.Entity.id;
    entityName = updatedUser.Entity.name;
  } else if (updatedUser?.entity_id) {
    entityId = updatedUser.entity_id;
    // Try to fetch entity name if not included
    const entity = await Entity.findByPk(updatedUser.entity_id);
    if (entity) {
      entityName = entity.name;
    }
  }

  // Send response
  return res.status(200).json(
    new ApiResponse("LOGIN_SUCCESSFUL", {
      token,
      user: {
        id: updatedUser.id,
        address: updatedUser.address,
        bio: updatedUser.bio,
        created_at: updatedUser.created_at,
        email: updatedUser.email,
        entity_id: entityId,
        entity_name: entityName,
        two_fa_enabled: updatedUser.two_fa_enabled,
        gender: updatedUser.gender,
        last_login_at: updatedUser.last_login_at,
        name: updatedUser.name,
        phone_number: updatedUser.phone_number,
        profile_picture_link: constructMediaLink(
          updatedUser.profile_picture_id
        ),
        role: updatedUser.role,
        roll_number: updatedUser.roll_number,
        status: updatedUser.status,
      },
    })
  );
});

const verifyAuthenticationCode = (authentication_code, secret_key) => {
  const verified = speakeasy.totp.verify({
    secret: secret_key,
    encoding: "base32",
    token: authentication_code,
    window: 1,
  });
  return verified;
};
