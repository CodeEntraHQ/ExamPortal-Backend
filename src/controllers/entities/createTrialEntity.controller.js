import Entity from "#models/entity.model.js";
import Media from "#models/media.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_STATUS, USER_ROLES } from "#utils/constants/model.constant.js";
import { getUserInvitationLink } from "#utils/crypto.util.js";
import { sendInvitationEmail } from "#utils/email-handler/triggerEmail.js";
import { generateUUID } from "#utils/utils.js";

export const createTrialEntity = ApiHandler(async (req, res) => {
  // Parsing request
  const name = req.body.name?.trim();
  const address = req.body.address?.trim();
  const type = req.body.type?.trim();
  const description = req.body.description?.trim();
  const email = req.body.email?.trim(); // Entity email
  const phone_number = req.body.phone_number?.trim();
  const admin_email = req.body.admin_email?.trim(); // Admin user email
  const logo = req.files?.logo?.[0];

  // Validation
  if (!name || !admin_email) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Entity name and admin email are required"
    );
  }

  // Check if entity exists
  const existingEntity = await Entity.findOne({ where: { name } });
  if (existingEntity) {
    throw new ApiError(
      409,
      "ENTITY_ALREADY_EXISTS",
      "Entity with this name already exists"
    );
  }

  // Check if admin email already exists
  const existingUser = await User.findOne({
    where: { email: admin_email },
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "USER_EXISTS",
      "User with this email already exists"
    );
  }

  // Handle logo upload
  let logoMedia;
  if (logo) {
    logoMedia = await Media.create({
      media: logo.buffer,
    });
  }

  // Calculate 14-day trial subscription end date
  const subscriptionEndDate = new Date();
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 14);

  // Create entity with 14-day trial and monitoring disabled
  const entity = await Entity.create({
    name,
    address: address || null,
    type: type || "COLLEGE",
    description: description || null,
    email: email || null,
    phone_number: phone_number || null,
    logo_id: logoMedia?.id || null,
    signature_id: null,
    subscription_end_date: subscriptionEndDate,
    monitoring_enabled: false, // Monitoring disabled for trial users
  });

  // Create ADMIN user with ACTIVATION_PENDING status
  const user_id = generateUUID();
  const adminUser = await User.create({
    id: user_id,
    name: null,
    email: admin_email,
    password_hash: null,
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVATION_PENDING,
    entity_id: entity.id,
    phone_number: null,
    address: null,
    bio: null,
    gender: null,
    roll_number: null,
  });

  // Get entity name for email
  const entityName = entity.name;

  // Send invitation email with set password link (same pattern as createUser)
  console.log("📧 Sending invitation email for created user:", {
    email: admin_email,
    role: USER_ROLES.ADMIN,
    entityName,
  });

  try {
    const invitationLink = getUserInvitationLink(user_id);
    const emailSent = await sendInvitationEmail(
      admin_email,
      USER_ROLES.ADMIN,
      invitationLink,
      {
        entityName,
        loginUrl: process.env.FRONTEND_HOST,
      }
    );

    if (!emailSent) {
      console.error("⚠️ User created but email failed to send:", {
        email: admin_email,
        role: USER_ROLES.ADMIN,
        entityName,
        loginUrl: process.env.FRONTEND_HOST,
        error: "Email service returned false",
      });
      throw new ApiError(500, "SEND_EMAIL_FAILURE", "Unable to send email");
    } else {
      console.log("✅ Invitation email sent successfully to:", admin_email);
    }
  } catch (error) {
    console.error("❌ Error sending invitation email for created user:", {
      email: admin_email,
      role: USER_ROLES.ADMIN,
      entityName,
      error: error.message,
      stack: error.stack,
    });
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "SEND_EMAIL_FAILURE", "Unable to send email");
  }

  // Extract token from invitation link for frontend redirect
  const invitationLink = getUserInvitationLink(user_id);
  const invitationToken = invitationLink.includes("token=")
    ? invitationLink.split("token=")[1]?.split("&")[0]
    : null;

  // Send response with invitation token for frontend redirect
  return res.status(200).json(
    new ApiResponse("TRIAL_ENTITY_CREATED", {
      entity_id: entity.id,
      entity_name: entity.name,
      admin_id: adminUser.id,
      admin_email: adminUser.email,
      invitation_token: invitationToken,
      subscription_end_date: entity.subscription_end_date,
    })
  );
});
