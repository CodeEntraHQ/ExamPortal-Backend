import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { getUserInvitationLink } from "#utils/crypto.util.js";
import { sendInvitationEmail } from "#utils/email-handler/triggerEmail.js";
import { generateUUID } from "#utils/utils.js";

export const inviteUser = ApiHandler(async (req, res) => {
  // Parsing request
  const { email, role, entity_id } = req.body;

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

  if (inviterRole === "SUPERADMIN" && !entity_id) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "entity_id is required for SUPERADMIN"
    );
  }

  const resolvedEntityId = entity_id || req.user.entity_id;

  // Check for duplicate email
  const existingUser = await User.findOne({
    where: { email: email },
  });

  if (existingUser && resolvedEntityId !== existingUser.entity_id) {
    throw new ApiError(400, "BAD_REQUEST", "user is already registered");
  }

  if (["INACTIVE", "ACTIVATION_PENDING"].includes(existingUser?.status)) {
    // Initiate activation process
    const invitationLink = getUserInvitationLink(existingUser?.id); // get invitation link
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
  const invitationLink = getUserInvitationLink(user_id); // get invitation link
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
      entity_id: entity_id || req.user.entity_id,
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
