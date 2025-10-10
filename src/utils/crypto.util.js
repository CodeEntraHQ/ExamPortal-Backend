import jwt from "jsonwebtoken";

import { TOKEN_TYPES } from "#utils/constants/meta.constant.js";
import asyncLocalStorage from "#utils/context.js";

const getJwtToken = (payload, expiry) => {
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: expiry });
};

const getJwtPayload = (data) => {
  const { session_id } = asyncLocalStorage.getStore();
  return {
    ...data,
    session_id,
  };
};

const getUserInvitationLink = (user_id) => {
  const payload = getJwtPayload({ user_id, type: TOKEN_TYPES.USER_INVITATION });
  const token = getJwtToken(payload, process.env.USER_INVITATION_TOKEN_EXPIRY);
  return process.env.USER_INVITATION_ENDPOINT + "?token=" + token;
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
