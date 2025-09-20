import jwt from "jsonwebtoken";

import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { TOKEN_TYPES } from "#utils/constants/meta.constant.js";
import { USER_STATUS } from "#utils/constants/model.constant.js";

const getQueryConditionAndTokenType = (decodedToken, req) => {
  const routeMap = {
    "/v1/users/register": {
      condition: {
        id: decodedToken.user_id,
        status: USER_STATUS.ACTIVATION_PENDING,
      },
      tokenType: TOKEN_TYPES.USER_INVITATION,
    },
    "/v1/users/password/reset": {
      condition: { id: decodedToken.user_id, status: USER_STATUS.ACTIVE },
      tokenType: TOKEN_TYPES.RESET_PASSWORD,
    },
    "/v1/users/login": {
      condition: { email: req.body?.email, status: USER_STATUS.ACTIVE },
      tokenType: TOKEN_TYPES.LOGIN_CAPTCHA,
    },
  };

  const match = routeMap[req.originalUrl];

  // Fallback/default case
  return [
    match?.condition || {
      id: decodedToken.user_id,
      status: USER_STATUS.ACTIVE,
    },
    match?.tokenType || TOKEN_TYPES.USER_SESSION,
  ];
};

export const verifyJWT = async (req, _res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "AUTHENTICATION_FAILED", "Invalid token details");
  }
  const [queryCondition, expectedTokenType] = getQueryConditionAndTokenType(
    decodedToken,
    req
  );

  if (expectedTokenType !== decodedToken.type) {
    throw new ApiError(401, "AUTHENTICATION_FAILED", "Invalid token type");
  }

  const user = await User.findOne({
    where: queryCondition,
  });
  if (!user) {
    throw new ApiError(401, "AUTHENTICATION_FAILED", "User not found");
  }

  req.user = user;
  req.captcha = decodedToken.captcha;

  next();
};
