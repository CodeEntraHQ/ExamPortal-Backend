import speakeasy from "speakeasy";

import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { TWO_FA_TOGGLE_MODE } from "#utils/constants/meta.constant.js";

export const toggleTwoFa = ApiHandler(async (req, res) => {
  const mode = req.body.mode?.trim();
  const authentication_code = req.body.authentication_code?.trim();

  if (mode === TWO_FA_TOGGLE_MODE.ENABLE) {
    if (req.user.two_fa_enabled) {
      throw new ApiError(400, "BAD_REQUEST", "Two FA is already enabled");
    }

    const verified = speakeasy.totp.verify({
      secret: req.user.two_fa_secret_key,
      encoding: "base32",
      token: authentication_code,
      window: 1,
    });

    if (verified) {
      req.user.two_fa_enabled = true;
      await req.user.save();
      return res.status(200).json(new ApiResponse("TWO_FA_ENABLED"));
    } else {
      throw new ApiError(400, "INVALID_DATA", "Invalid authentication code");
    }
  } else {
    if (!req.user.two_fa_enabled) {
      throw new ApiError(400, "BAD_REQUEST", "Two FA is already disabled");
    }

    const verified = speakeasy.totp.verify({
      secret: req.user.two_fa_secret_key,
      encoding: "base32",
      token: authentication_code,
      window: 1,
    });

    if (verified) {
      req.user.two_fa_enabled = false;
      req.user.two_fa_secret_key = null;
      await req.user.save();
      return res.status(200).json(new ApiResponse("TWO_FA_DISABLED"));
    } else {
      throw new ApiError(400, "INVALID_DATA", "Invalid authentication code");
    }
  }
});
