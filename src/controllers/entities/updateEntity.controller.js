import Entity from "#models/entity.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const updateEntity = ApiHandler(async (req, res) => {
  // Parsing request
  const entity_id = req.body.entity_id?.trim();
  const name = req.body.name?.trim();
  const address = req.body.address?.trim();
  const type = req.body.type?.trim();

  // Update entity
  const updateData = {
    ...(name && { name }),
    ...(address && { address }),
    ...(type && { type }),
  };
  const [updatedCount, updatedEntity] = await Entity.update(updateData, {
    where: { id: entity_id },
    returning: true,
  });

  // Check if no entity is updated
  if (updatedCount === 0) {
    throw new ApiError(400, "ENTITY_NOT_FOUND", "Entity not found");
  }

  // Send response
  return res.status(200).json(
    new ApiResponse("ENTITY_UPDATED", {
      id: updatedEntity[0].id,
      name: updatedEntity[0].name,
      address: updatedEntity[0].address,
      type: updatedEntity[0].type,
    })
  );
});
