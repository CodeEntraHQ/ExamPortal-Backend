import Entity from "#models/entity.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_STATUS } from "#utils/constants/model.constant.js";
import { getUserInvitationLink } from "#utils/crypto.util.js";
import { sendInvitationEmail } from "#utils/email-handler/triggerEmail.js";
import { generateUUID } from "#utils/utils.js";

const getEntityName = async (entityId) => {
  if (!entityId) return "your organization";
  const entity = await Entity.findByPk(entityId);
  return entity?.name || "your organization";
};

export const createUser = ApiHandler(async (req, res) => {
  // Parsing request
  const email = req.body.email?.trim();
  const name = req.body.name?.trim();
  const role = req.body.role?.trim();
  const entity_id = req.body.entity_id?.trim();
  // Phone number can be a number (after validation coercion) or string, convert to string for storage
  const phone_number = req.body.phone_number
    ? typeof req.body.phone_number === "number"
      ? String(req.body.phone_number)
      : req.body.phone_number.trim()
    : null;
  const address = req.body.address?.trim();
  const bio = req.body.bio?.trim();
  const gender = req.body.gender?.trim();
  const roll_number = req.body.roll_number?.trim();

  // Authorization checks
  const inviterRole = req.user.role;
  if (
    role === "SUPERADMIN" ||
    (role === "ADMIN" && inviterRole !== "SUPERADMIN") ||
    (role === "STUDENT" && !["ADMIN", "SUPERADMIN"].includes(inviterRole)) ||
    (role === "REPRESENTATIVE" &&
      !["ADMIN", "SUPERADMIN"].includes(inviterRole)) ||
    inviterRole === "STUDENT"
  ) {
    throw new ApiError(
      403,
      "AUTHORIZATION_FAILED",
      "User creation hierarchy violated"
    );
  }

  // For REPRESENTATIVE, entity_id is required for SUPERADMIN, optional for ADMIN (uses admin's entity)
  // For SUPERADMIN creating other roles, entity_id is required
  if (inviterRole === "SUPERADMIN" && !entity_id) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "entity_id is required for SUPERADMIN"
    );
  }

  // Representatives are now bound to an entity
  // For ADMIN creating representatives, use admin's entity_id
  // For SUPERADMIN, use provided entity_id
  // For other roles, use provided entity_id or current user's entity_id
  const resolvedEntityId = entity_id || req.user.entity_id;

  if (!resolvedEntityId) {
    throw new ApiError(400, "BAD_REQUEST", "entity_id is required");
  }

  // Check for duplicate email
  const existingUser = await User.findOne({
    where: { email: email },
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "USER_EXISTS",
      "User with this email already exists"
    );
  }

  // Get entity name for email
  const entityName = await getEntityName(resolvedEntityId);

  // Create user with ACTIVATION_PENDING status (no password)
  const user_id = generateUUID();
  const user = await User.create({
    id: user_id,
    name: name || null,
    email: email,
    password_hash: null,
    role: role,
    status: USER_STATUS.ACTIVATION_PENDING,
    entity_id: resolvedEntityId,
    phone_number: phone_number || null,
    address: address || null,
    bio: bio || null,
    gender: gender || null,
    roll_number: roll_number || null,
  });

  // Send invitation email with set password link (no password)
  console.log("📧 Sending invitation email for created user:", {
    email,
    role,
    entityName,
  });

  try {
    const invitationLink = getUserInvitationLink(user_id);
    const emailSent = await sendInvitationEmail(email, role, invitationLink, {
      entityName,
      loginUrl: process.env.LOGIN_PORTAL_URL,
    });

    if (!emailSent) {
      console.error("⚠️ User created but email failed to send:", {
        email,
        role,
        entityName,
        loginUrl: process.env.LOGIN_PORTAL_URL,
        error: "Email service returned false",
      });
      throw new ApiError(500, "SEND_EMAIL_FAILURE", "Unable to send email");
    } else {
      console.log("✅ Invitation email sent successfully to:", email);
    }
  } catch (error) {
    console.error("❌ Error sending invitation email for created user:", {
      email,
      role,
      entityName,
      error: error.message,
      stack: error.stack,
    });
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "SEND_EMAIL_FAILURE", "Unable to send email");
  }

  return res.status(200).json(
    new ApiResponse("USER_CREATED", {
      id: user.id,
      email: user.email,
      role: user.role,
    })
  );
});
