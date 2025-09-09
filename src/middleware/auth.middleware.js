import jwt from "jsonwebtoken";
import User from "#models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        status: "FAILURE",
        responseMsg: "AUTHENTICATION_FAILED",
      });
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userStatus =
      req.originalUrl == "/v1/users/register" ? "ACTIVATION_PENDING" : "ACTIVE";
    const user = await User.findOne({
      where: { id: decodedToken.user_id, status: userStatus },
    });
    if (!user) {
      return res.status(401).json({
        status: "FAILURE",
        responseMsg: "AUTHENTICATION_FAILED",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      status: "FAILURE",
      responseMsg: "AUTHENTICATION_FAILED",
    });
  }
};
