import sequelize from "../db/index.js";
import User from "../models/user.model.js";
import Collage from "../models/collage.model.js";

import bcrypt from "bcrypt";
import { Op } from "sequelize";

import jwt from "jsonwebtoken";

function generateAccessToken(id, email) {
  return jwt.sign({ id, email }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
}

// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, entity_id, role } = req.body;

//     if (
//       [name, email, password, entity_id, role].some(
//         (field) => !field || String(field).trim() === ""
//       )
//     ) {
//       return res.status(409).json({
//         status: "failure",
//         responseMsg: "All fields are required",
//       });
//     }

//     // Check if email exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({
//         status: "failure",
//         responseMsg: "Email Already Exists",
//       });
//     }

//     // Hash password
//     const password_hash = await bcrypt.hash(password, 10);

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password_hash,
//       entity_id,
//       role,
//       active: true,
//     });

//     return res.status(201).json({
//       status: "Success",
//       responseMsg: "Login Successful",
//       payload: {
//         user: {
//           name: user.name,
//           email: user.email,
//           role: user.role,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Register error:", error);
//     return res.status(500).json({
//       status: "Failure",
//       responseMsg: "Internal server Error",
//     });
//   }
// };

const onboardUsers = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, password, role, college_id } = req.body;

    // Validate all fields
    if (
      [name, email, password, role, college_id].some(
        (field) => !field || String(field).trim() === ""
      )
    ) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "All_Feild are required",
      });
    }

    // Check for existing email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: "FAILURE",
        responseMsg: "USER_ALREADY_EXISTS",
      });
    }

    // Check for existing email
    const existingCollage = await Collage.findOne({
      where: { id: college_id },
    });
    if (!existingCollage) {
      return res.status(409).json({
        status: "FAILURE",
        responseMsg: "COLLAGE_dOES_NOT_EXISTS",
      });
    }

    if (req.user.role === "SUPERADMIN") {
      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user with entity_id from college_id
      const user = await User.create({
        name,
        email,
        password_hash,
        entity_id: college_id,
        role,
        active: true,
      });

      await t.commit();
      return res.status(201).json({
        status: "SUCCESS",
        responseMsg: "USER_ONBOARDED",
        payload: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
        },
      });
    } else {
      await t.rollback();
      return res.status(401).json({
        status: "FAILURE",
        responseMsg: "Unauthorized request",
      });
    }
  } catch (error) {
    // console.error("Register error:", error);
    await t.rollback();
    return res.status(500).json({
      status: "FAILURE",
      responseMsg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email && !username) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "AUTHENTICATION_FAILED",
      });
    }

    const conditions = [];
    if (email?.trim()) conditions.push({ email });
    if (username?.trim()) conditions.push({ username });

    const user = await User.findOne({
      where: {
        [Op.or]: conditions,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "FAILURE",
        responseMsg: "AUTHENTICATION_FAILED",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "AUTHENTICATION_FAILED",
      });
    }

    const token = generateAccessToken(user.id, user.email);

    return res.status(200).json({
      status: "SUCCESS",
      responseMsg: "LOGIN_SUCCESSFUL",
      payload: {
        token,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "FAILURE",
      responseMsg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const collegeId = req.query.college_id;
    const role = (req.query.role).toUpperCase();

    // Authorization check
    if (req.user.role !== "SUPERADMIN") {
      return res.status(401).json({
        status: "FAILURE",
        responseMsg: "Unauthorized request",
      });
    }

    // Fetch all users with role = 'ADMIN'
    const { rows: admins, count: total } = await User.findAndCountAll({
      where: { role, entity_id: collegeId },
      offset,
      limit,
      attributes: ["id", "name", "email", "role", "active"],
      order: [["created_at", "ASC"]],
    });

    return res.status(200).json({
      status: "SUCCESS",
      responseMsg: "ADMINS_FETCHED",
      payload: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        users: admins,
      },
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return res.status(500).json({
      status: "FAILURE",
      responseMsg: "INTERNAL_SERVER_ERROR",
    });
  }
};

const studentRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, password } = req.body;

    // Validate all fields
    if (
      [name, email, password].some(
        (field) => !field || String(field).trim() === ""
      )
    ) {
      return res.status(400).json({
        status: "FAILURE",
        responseMsg: "All_Feild are required",
      });
    }

    // Check for existing email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: "FAILURE",
        responseMsg: "USER_ALREADY_EXISTS",
      });
    }

    // Hashing Password
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password_hash,
      role: "STUDENT",
      active: true
    });

    await t.commit();
    return res.status(201).json({
      status: "SUCCESS",
      responseMsg: "STUDENT_REGISTERED",
      payload: {
        id: user.id,
        role: user.role
      },
    });

  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      status: "FAILURE",
      responseMsg: "INTERNAL_SERVER_ERROR",
    });
  }
}

export { onboardUsers, loginUser, getAllAdmins, studentRegistration };
