import Entity from "#models/entity.model.js";
import Exam from "#models/exam.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";
import { constructMediaLink } from "#utils/utils.js";

export const getEntityById = ApiHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "BAD_REQUEST", "Entity ID is required");
  }

  // Find entity
  const entity = await Entity.findByPk(id);

  if (!entity) {
    throw new ApiError(404, "ENTITY_NOT_FOUND", "Entity not found");
  }

  // Check authorization
  // SUPERADMIN can access any entity
  // ADMIN can only access their own entity
  if (req.user.role === USER_ROLES.SUPERADMIN) {
    // SUPERADMIN can access any entity
  } else if (req.user.role === USER_ROLES.ADMIN) {
    // ADMIN can only access their own entity
    if (entity.id !== req.user.entity_id) {
      throw new ApiError(
        403,
        "FORBIDDEN",
        "You don't have permission to access this entity"
      );
    }
  } else {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You don't have permission to access entities"
    );
  }

  // Get counts
  const total_exams = await Exam.count({ where: { entity_id: entity.id } });
  const total_students = await User.count({
    where: { entity_id: entity.id, role: USER_ROLES.STUDENT },
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("ENTITY_FETCHED", {
      id: entity.id,
      address: entity.address,
      created_at: entity.created_at,
      description: entity.description,
      email: entity.email,
      logo_link: constructMediaLink(entity.logo_id),
      signature_link: constructMediaLink(entity.signature_id),
      name: entity.name,
      phone_number: entity.phone_number,
      status: "ACTIVE",
      total_exams,
      total_students,
      type: entity.type,
      monitoring_enabled:
        entity.monitoring_enabled !== undefined
          ? entity.monitoring_enabled
          : true,
    })
  );
});
