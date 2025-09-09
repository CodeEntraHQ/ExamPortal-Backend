import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { sendInvitationEmail } from "#utils/email-handler/triggerEmail.js";
import asyncLocalStorage from "#utils/context.js";
import jwt from "jsonwebtoken";
import { generateUUID } from "#utils/utils.js";

export const inviteUser = ApiHandler(async (req, res) => {
  // Parsing request
  const { email, role, college_id } = req.body;

  // Request assertion
  if ([email, role].some((field) => !field || String(field).trim() === "")) {
    throw new ApiError(400, "BAD_REQUEST", "Missing required fields");
  }

  // STUDENT can be invited by SUPERADMIN / ADMIN
  // ADMIN can only be invited by SUPERADMIN
  // SUPERADMIN cannot be invited
  const inviterRole = req.user.role;
  if (
    role === "SUPERADMIN" ||
    (role === "ADMIN" && inviterRole !== "SUPERADMIN") ||
    (role === "STUDENT" && !["ADMIN", "SUPERADMIN"].includes(inviterRole)) ||
    inviterRole === "STUDENT"
  ) {
    throw new ApiError(
      403,
      "AUTHORIZATION_FAILED",
      "User invitation hierarchy violated"
    );
  }

  if (inviterRole === "SUPERADMIN" && !college_id) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "college_id is required for SUPERADMIN"
    );
  }

  const resolvedCollegeId = college_id || req.user.entity_id;

  // Check for duplicate email
  const existingUser = await User.findOne({
    where: { email: email },
  });

  if (existingUser && resolvedCollegeId !== existingUser.entity_id) {
    throw new ApiError(400, "BAD_REQUEST", "user is already registered");
  }

  if (["INACTIVE", "ACTIVATION_PENDING"].includes(existingUser?.status)) {
    // Initiate activation process
    const invitationLink = getRegistrationLink(email, existingUser?.id); // get invitation link
    const emailSent = await sendInvitationEmail(email, role, invitationLink); // trigger email
    // if email was sent update the status
    if (emailSent === true) {
      const user = await existingUser.update({
        status: "ACTIVATION_PENDING",
      });
      // Send response
      return res.status(200).json(
        new ApiResponse("USER_INVITED", {
          id: user.id,
          role: user.role,
        })
      );
    }
    // else throw error
    else {
      throw new ApiError(500, "SEND_EMAIL_FAILURE", "Unable to send email");
    }
  } else if (existingUser?.status === "ACTIVE") {
    throw new ApiError(409, "USER_IS_ACTIVE", "User is already active");
  }

  // Procced with new user registration
  const user_id = generateUUID();
  const invitationLink = getRegistrationLink(email, user_id); // get invitation link
  const emailSent = await sendInvitationEmail(email, role, invitationLink); // trigger email
  if (emailSent === true) {
    // Create user
    const user = await User.create({
      id: user_id,
      name: null,
      email,
      password_hash: null,
      role: role,
      status: "ACTIVATION_PENDING",
      entity_id: college_id || req.user.entity_id,
    });

    // Send response
    return res.status(200).json(
      new ApiResponse("USER_INVITED", {
        id: user.id,
        role: user.role,
      })
    );
  }
  // else throw error
  else {
    throw new ApiError(500, "SEND_EMAIL_FAILURE", "Unable to send email");
  }
});

// TODO: unify all jwt token generation
const getRegistrationLink = (email, user_id) => {
  const { session_id } = asyncLocalStorage.getStore();
  let registrationToken = jwt.sign(
    { user_id, email, session_id },
    process.env.INVITATION_TOKEN_SECRET,
    {
      expiresIn: process.env.INVITATION_TOKEN_EXPIRY,
    }
  );
  let registrationLink =
    process.env.USER_INVITATION_ENDPOINT + "?token=" + registrationToken;
  return registrationLink;
};
