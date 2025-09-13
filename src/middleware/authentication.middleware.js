import jwt from "jsonwebtoken";

import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { TOKEN_TYPES } from "#utils/constants.util.js";

const getUserStatusAndTokenType = (url) => {
  if (url === "/v1/users/register") {
    return ["ACTIVATION_PENDING", TOKEN_TYPES.USER_INVITATION];
  } else if (url === "/v1/users/password/reset") {
    return ["ACTIVE", TOKEN_TYPES.RESET_PASSWORD];
  } else {
    return ["ACTIVE", TOKEN_TYPES.USER_SESSION];
  }
};

export const verifyJWT = async (req, _res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "AUTHENTICATION_FAILED", "Invalid token details");
  }
  const [userStatus, expectedTokenType] = getUserStatusAndTokenType(
    req.originalUrl
  );

  if (expectedTokenType !== decodedToken.type) {
    throw new ApiError(401, "AUTHENTICATION_FAILED", "Invalid token type");
  }

  const user = await User.findOne({
    where: { id: decodedToken.user_id, status: userStatus },
  });
  if (!user) {
    throw new ApiError(401, "AUTHENTICATION_FAILED", "User not found");
  }

  req.user = user;
  next();
};
