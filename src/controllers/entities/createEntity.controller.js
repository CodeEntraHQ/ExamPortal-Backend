import Entity from "#models/entity.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const createEntity = ApiHandler(async (req, res) => {
  // Parsing request
  const name = req.body.name?.trim();
  const address = req.body.address?.trim();
  const type = req.body.type?.trim();

  // Check if entity exists
  const existingEntity = await Entity.findOne({ where: { name } });
  if (existingEntity) {
    throw new ApiError(
      409,
      "ENTITY_ALREADY_EXISTS",
      "Entity with this name already exists"
    );
  }

  // Create entity
  const entity = await Entity.create({
    name,
    address,
    type,
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("ENTITY_ONBOARDED", {
      id: entity.id,
      name: entity.name,
      address: entity.address,
      type: entity.type,
    })
  );
});
