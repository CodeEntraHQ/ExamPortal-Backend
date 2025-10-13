import qrcode from "qrcode";
import speakeasy from "speakeasy";

import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

const generateTwoFa = ApiHandler(async (req, res) => {
  if (req.user.two_fa_enabled) {
    throw new ApiError(400, "BAD_REQUEST", "Two FA is already enabled");
  }

  const secret = speakeasy.generateSecret({
    name: `ExamEntra:${req.user.email}`,
  });

  req.user.two_fa_secret_key = secret.base32;
  await req.user.save();

  try {
    const data_url = await qrcode.toDataURL(secret.otpauth_url);
    return res.status(200).json(
      new ApiResponse("QR_CODE_GENERATED", {
        qr_code: data_url,
        manual_code: secret.base32,
      })
    );
  } catch {
    throw new ApiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Error generating QR code"
    );
  }
});

export { generateTwoFa };
