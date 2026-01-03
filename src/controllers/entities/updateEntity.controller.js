import Entity from "#models/entity.model.js";
import Exam from "#models/exam.model.js";
import Media from "#models/media.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";
import { constructMediaLink } from "#utils/utils.js";

export const updateEntity = ApiHandler(async (req, res) => {
  // Parsing request
  const entity_id = req.body.entity_id?.trim();
  const name = req.body.name?.trim();
  const address = req.body.address?.trim();
  const type = req.body.type?.trim();
  const description = req.body.description?.trim();
  const email = req.body.email?.trim();
  const phone_number = req.body.phone_number?.trim();
  const monitoring_enabled =
    req.body.monitoring_enabled !== undefined
      ? req.body.monitoring_enabled === "true" ||
        req.body.monitoring_enabled === true
      : undefined;
  const logo = req.files?.logo?.[0];
  const signature = req.files?.signature?.[0];
  const subscription_years = req.body.subscription_years
    ? parseInt(req.body.subscription_years)
    : undefined;
  const subscription_months = req.body.subscription_months
    ? parseInt(req.body.subscription_months)
    : undefined;
  const subscription_days = req.body.subscription_days
    ? parseInt(req.body.subscription_days)
    : undefined;

  let logoMedia;
  if (logo) {
    logoMedia = await Media.create({
      media: logo.buffer,
    });
  }

  let signatureMedia;
  if (signature) {
    signatureMedia = await Media.create({
      media: signature.buffer,
    });
  }

  // Calculate subscription end date if subscription duration is provided
  let subscription_end_date = undefined;
  if (
    subscription_years !== undefined ||
    subscription_months !== undefined ||
    subscription_days !== undefined
  ) {
    const endDate = new Date();
    const years = subscription_years || 0;
    const months = subscription_months || 0;
    const days = subscription_days || 0;
    if (years > 0 || months > 0 || days > 0) {
      endDate.setFullYear(endDate.getFullYear() + years);
      endDate.setMonth(endDate.getMonth() + months);
      endDate.setDate(endDate.getDate() + days);
      subscription_end_date = endDate;
    } else {
      subscription_end_date = null;
    }
  }

  // Update entity
  const updateData = {
    ...(name && { name }),
    ...(address && { address }),
    ...(type && { type }),
    ...(description && { description }),
    ...(email && { email }),
    ...(phone_number && { phone_number }),
    ...(logo && { logo_id: logoMedia.id }),
    ...(signature && { signature_id: signatureMedia.id }),
    ...(monitoring_enabled !== undefined && { monitoring_enabled }),
    ...(subscription_end_date !== undefined && { subscription_end_date }),
  };

  const entity = await Entity.findByPk(entity_id);

  // Check if no entity is updated
  if (!entity) {
    throw new ApiError(400, "ENTITY_NOT_FOUND", "Entity not found");
  }

  // Check authorization - ADMIN can only update their own entity
  if (req.user.role === "ADMIN" && entity.id !== req.user.entity_id) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You don't have permission to update this entity"
    );
  }

  // Block ADMIN users from updating subscription (financial security)
  if (req.user.role === "ADMIN" && subscription_end_date !== undefined) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "ADMIN users are not allowed to update subscription information"
    );
  }

  if (logo && entity.logo_id) {
    await Media.destroy({ where: { id: entity.logo_id } });
  }

  if (signature && entity.signature_id) {
    await Media.destroy({ where: { id: entity.signature_id } });
  }

  const updatedEntity = await entity.update(updateData);

  // If monitoring is disabled at entity level, disable it for all exams in this entity
  if (monitoring_enabled === false) {
    await Exam.update(
      { monitoring_enabled: false },
      { where: { entity_id: updatedEntity.id } }
    );
  }

  // Get counts
  const total_exams = await Exam.count({
    where: { entity_id: updatedEntity.id },
  });
  const total_students = await User.count({
    where: { entity_id: updatedEntity.id, role: USER_ROLES.STUDENT },
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("ENTITY_UPDATED", {
      id: updatedEntity.id,
      address: updatedEntity.address,
      created_at: updatedEntity.created_at,
      description: updatedEntity.description,
      email: updatedEntity.email,
      logo_link: constructMediaLink(updatedEntity.logo_id),
      signature_link: constructMediaLink(updatedEntity.signature_id),
      name: updatedEntity.name,
      phone_number: updatedEntity.phone_number,
      status: "ACTIVE",
      total_exams,
      total_students,
      type: updatedEntity.type,
      monitoring_enabled: updatedEntity.monitoring_enabled,
      subscription_end_date: updatedEntity.subscription_end_date,
    })
  );
});
