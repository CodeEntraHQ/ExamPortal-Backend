import Entity from "#models/entity.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { getUserInvitationLink } from "#utils/crypto.util.js";
import { sendInvitationEmail } from "#utils/email-handler/triggerEmail.js";
import { generateUUID } from "#utils/utils.js";

const getEntityName = async (entityId) => {
  if (!entityId) return "your organization";
  try {
    const entity = await Entity.findByPk(entityId);
    return entity?.name || "your organization";
  } catch (error) {
    console.error("⚠️ Failed to fetch entity name:", error);
    return "your organization";
  }
};

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
    try {
      const entityName = await getEntityName(resolvedEntityId);
      const invitationLink = getUserInvitationLink(existingUser?.id);
      const emailSent = await sendInvitationEmail(email, role, invitationLink, {
        entityName,
        loginUrl: process.env.LOGIN_PORTAL_URL,
      });

      if (emailSent === true) {
        const user = await existingUser.update({
          status: "ACTIVATION_PENDING",
        });
        console.log("✅ Invitation email sent successfully to:", email);
        return res.status(200).json(
          new ApiResponse("USER_INVITED", {
            id: user.id,
            role: user.role,
          })
        );
      } else {
        console.error("⚠️ Failed to send invitation email:", {
          email,
          role,
          entityName,
        });
        throw new ApiError(500, "SEND_EMAIL_FAILURE", "Unable to send email");
      }
    } catch (error) {
      console.error("❌ Error in invite user flow (existing user):", {
        email,
        role,
        error: error.message,
        stack: error.stack,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "SEND_EMAIL_FAILURE", "Unable to send email");
    }
  } else if (existingUser?.status === "ACTIVE") {
    throw new ApiError(409, "USER_IS_ACTIVE", "User is already active");
  }

  // Proceed with new user registration
  try {
    const user_id = generateUUID();
    const entityName = await getEntityName(resolvedEntityId);
    const invitationLink = getUserInvitationLink(user_id);
    const emailSent = await sendInvitationEmail(email, role, invitationLink, {
      entityName,
      loginUrl: process.env.LOGIN_PORTAL_URL,
    });

    if (emailSent === true) {
      const user = await User.create({
        id: user_id,
        name: null,
        email,
        password_hash: null,
        role: role,
        status: "ACTIVATION_PENDING",
        entity_id: entity_id || req.user.entity_id,
      });

      console.log("✅ Invitation email sent successfully to:", email);
      return res.status(200).json(
        new ApiResponse("USER_INVITED", {
          id: user.id,
          role: user.role,
        })
      );
    } else {
      console.error("⚠️ Failed to send invitation email:", {
        email,
        role,
        entityName,
      });
      throw new ApiError(500, "SEND_EMAIL_FAILURE", "Unable to send email");
    }
  } catch (error) {
    console.error("❌ Error in invite user flow (new user):", {
      email,
      role,
      error: error.message,
      stack: error.stack,
    });
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "SEND_EMAIL_FAILURE", "Unable to send email");
  }
});
