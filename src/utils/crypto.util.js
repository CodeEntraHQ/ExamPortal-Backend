import jwt from "jsonwebtoken";

import { TOKEN_TYPES } from "#utils/constants/meta.constant.js";
import asyncLocalStorage from "#utils/context.js";

const getJwtToken = (payload, expiry) => {
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: expiry });
};

const getJwtPayload = (data) => {
  const store = asyncLocalStorage.getStore();
  const session_id = store?.session_id || null;
  return {
    ...data,
    ...(session_id && { session_id }),
  };
};

const getUserInvitationLink = (user_id) => {
  const payload = getJwtPayload({ user_id, type: TOKEN_TYPES.USER_INVITATION });
  const token = getJwtToken(payload, process.env.USER_INVITATION_TOKEN_EXPIRY);

  // Use FRONTEND_HOST or FRONTEND_URL for set password link
  // This should be the frontend host/URL, not the backend API endpoint
  const frontendUrl = process.env.FRONTEND_HOST || process.env.FRONTEND_URL;

  // Clean up URL - remove trailing slash
  const baseUrl = frontendUrl.endsWith("/")
    ? frontendUrl.slice(0, -1)
    : frontendUrl;
  // Use /set-password endpoint for clarity
  return baseUrl + "/set-password?token=" + token;
};

const getResetPasswordLink = (user_id) => {
  const payload = getJwtPayload({ user_id, type: TOKEN_TYPES.RESET_PASSWORD });
  const token = getJwtToken(payload, process.env.RESET_PASSWORD_TOKEN_EXPIRY);
  return process.env.RESET_PASSWORD_ENDPOINT + "?token=" + token;
};

const generateUserSessionToken = (user_id) => {
  const payload = getJwtPayload({ user_id, type: TOKEN_TYPES.USER_SESSION });
  return getJwtToken(payload, process.env.USER_SESSION_TOKEN_EXPIRY);
};

export {
  getUserInvitationLink,
  getResetPasswordLink,
  generateUserSessionToken,
};
