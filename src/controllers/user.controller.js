import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import Course from "../models/courses.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";

import jwt from "jsonwebtoken";

function generateAccesKey(id, username, email) {
  return jwt.sign({ id, username, email }, process.env.TOKEN_SECRET);
}

const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, course_id, password } = req.body;
  // console.log("email", email);

  if (
    [name, username, email, course_id, password].some(
      (field) => !field || String(field).trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const conditions = [{ email }];
  if (username?.trim()) {
    conditions.push({ username });
  }

  // here we have to check user on basis of username or email
  const existedUser = await User.findOne({
    where: {
      [Op.or]: conditions,
    },
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  const existedCourse = await Course.findOne({
    where: {
      id: course_id,
    },
  });

  if (!existedCourse) {
    throw new ApiError(409, "Course with course_id is not exist");
  }

  const hashedPassword = await bcrypt.hash(password, 10); // 10 = saltRounds

  const role = username.toLowerCase().includes("admin") ? "admin" : "student";

  const newUser = await User.create({
    name,
    email,
    course_id,
    username: (username || "").toLowerCase(),
    password_hash: hashedPassword,
    role,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, {}, "User registerd Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const conditions = [];
  if (email?.trim()) {
    conditions.push({ email });
  }
  if (username?.trim()) {
    conditions.push({ username });
  }

  // here we have to check user on basis of username or email
  const existedUser = await User.findOne({
    where: {
      [Op.or]: conditions,
    },
  });

  if (!existedUser) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = existedUser.password_hash;

  bcrypt.compare(password, isPasswordValid, async (err, result) => {
    if (err) {
      throw new Error("Password incorrect");
    }
    if (result == true) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            user: { name: existedUser.name, role: existedUser.role },
            token: generateAccesKey(
              existedUser.id,
              existedUser.username,
              existedUser.email
            ),
          },
          "User logged In successfully"
        )
      );
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Password incorrect" });
    }
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password_hash", "course_id"] },
    include: [
      {
        model: Course,
        as: "Course", // alias, but only needed if you defined one
        attributes: ["id", "name"], // choose what to expose
      },
    ],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, users ?? [], "Users fetched successfully"));
});

export { registerUser, loginUser, getAllUsers };
