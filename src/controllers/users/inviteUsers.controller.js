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

  if (role === "ADMIN" && !college_id) {
    throw new ApiError(400, "BAD_REQUEST", "college_id is required");
  }

  if (role === "STUDENT" && college_id) {
    throw new ApiError(400, "BAD_REQUEST", "college_id is not required");
  }

  // STUDENT can be invited by SUPERADMIN / ADMIN
  // ADMIN can only be invited by SUPERADMIN
  // SUPERADMIN cannot be invited
  let inviterRole = req.user.role;
  if (
    role === "SUPERADMIN" ||
    (role === "ADMIN" && inviterRole !== "SUPERADMIN") ||
    (role === "STUDENT" && !["ADMIN", "SUPERADMIN"].includes(inviterRole))
  ) {
    throw new ApiError(
      403,
      "AUTHORIZATION_FAILED",
      "User invitation hierarchy violated"
    );
  }

  // Check for duplicate email
  const existingUser = await User.findOne({
    where: { email: email, entity_id: req.user.entity_id },
  });

  if (["INACTIVE", "ACTIVATION_PENDING"].includes(existingUser?.status)) {
    // Initiate activation process
    let invitationLink = getRegistrationLink(email, existingUser?.id); // get invitation link
    let emailSent = await sendInvitationEmail(email, invitationLink); // trigger email
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
  let invitationLink = getRegistrationLink(email, user_id); // get invitation link
  let emailSent = await sendInvitationEmail(email, invitationLink); // trigger email
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
    process.env.APP_HOST + "/v1/users/register?token=" + registrationToken;
  return registrationLink;
};
