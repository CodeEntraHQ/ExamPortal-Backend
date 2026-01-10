import Entity from "#models/entity.model.js";
import Media from "#models/media.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const deleteEntity = ApiHandler(async (req, res) => {
  const entity_id = req.params?.id?.trim();

  if (!entity_id) {
    throw new ApiError(400, "BAD_REQUEST", "entity_id parameter is required");
  }

  // Only SUPERADMIN can delete entities
  if (req.user.role !== "SUPERADMIN") {
    throw new ApiError(
      403,
      "AUTHORIZATION_FAILED",
      "Only SUPERADMIN can delete entities"
    );
  }

  const entity = await Entity.findByPk(entity_id);

  if (!entity) {
    throw new ApiError(404, "ENTITY_NOT_FOUND", "Entity not found");
  }

  // Delete associated media (logo and signature) if they exist
  if (entity.logo_id) {
    await Media.destroy({ where: { id: entity.logo_id } });
  }
  if (entity.signature_id) {
    await Media.destroy({ where: { id: entity.signature_id } });
  }

  // Delete the entity
  // Note: Associated users, exams, and other data will be handled by database constraints
  // If foreign key constraints are set up, they should handle cascading deletes
  await entity.destroy();

  return res.status(200).json(new ApiResponse("ENTITY_DELETED"));
});
