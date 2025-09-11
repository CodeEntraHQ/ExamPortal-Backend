import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { generateUserSessionToken } from "#utils/crypto.util.js";

export const renewLogin = ApiHandler(async (req, res) => {
  // Generate session token
  const token = generateUserSessionToken(req.user.id);

  // Send response
  return res.status(200).json(
    new ApiResponse("RENEW_SUCCESSFUL", {
      token,
    })
  );
});
