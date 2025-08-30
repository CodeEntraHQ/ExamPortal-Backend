import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        status: "FAILURE",
        responseMsg: "Unauthorized request",
      });
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findOne({ where: { id: decodedToken.id } });
    if (!user) {
      return res.status(401).json({
        status: "FAILURE",
        responseMsg: "Invalid access token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // console.error("JWT Verification Error:", error);
    return res.status(401).json({
      status: "FAILURE",
      responseMsg: error.message || "Invalid access token",
    });
  }
};
