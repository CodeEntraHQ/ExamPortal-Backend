import bcrypt from "bcrypt";
import svgCaptcha from "svg-captcha";

import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { NODE_ENVS } from "#utils/constants/meta.constant.js";
import { generateLoginCaptchaToken } from "#utils/crypto.util.js";
import { encodeBase64 } from "#utils/utils.js";

export const getCaptcha = ApiHandler(async (req, res) => {
  const captchaRaw = svgCaptcha.createMathExpr({
    mathMin: 1,
    mathMax: 9,
    mathOperator: "+", // '+', '-', '*', '/' or random if omitted
    noise: 2,
    background: "#ffe6cc",
  });
  const hashedAnswer = await bcrypt.hash(captchaRaw.text, 10);
  const token = generateLoginCaptchaToken(hashedAnswer);
  const captcha = encodeBase64(captchaRaw.data);
  let captchaAnswer = null;
  // only return if env is dev
  if ([NODE_ENVS.DEV, NODE_ENVS.TEST].includes(process.env.NODE_ENV)) {
    captchaAnswer = captchaRaw.text;
  }
  return res.status(200).json(
    new ApiResponse("CAPTCHA_GENERATED", {
      token,
      captcha,
      captchaAnswer,
    })
  );
});
