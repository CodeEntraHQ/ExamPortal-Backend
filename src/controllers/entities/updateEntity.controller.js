import Entity from "#models/entity.model.js";
import Media from "#models/media.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
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
  const logo = req.file;

  let media;
  if (logo) {
    media = await Media.create({
      media: logo.buffer,
    });
  }

  // Update entity
  const updateData = {
    ...(name && { name }),
    ...(address && { address }),
    ...(type && { type }),
    ...(description && { description }),
    ...(email && { email }),
    ...(phone_number && { phone_number }),
    ...(logo && { logo_id: media.id }),
  };

  const entity = await Entity.findByPk(entity_id);

  // Check if no entity is updated
  if (!entity) {
    throw new ApiError(400, "ENTITY_NOT_FOUND", "Entity not found");
  }

  if (entity.logo_id) {
    await Media.destroy({ where: { id: entity.logo_id } });
  }

  const updatedEntity = await entity.update(updateData);

  // Send response
  return res.status(200).json(
    new ApiResponse("ENTITY_UPDATED", {
      id: updatedEntity.id,
      address: updatedEntity.address,
      created_at: updatedEntity.created_at,
      description: updatedEntity.description,
      email: updatedEntity.email,
      logo_link: constructMediaLink(updatedEntity.logo_id),
      name: updatedEntity.name,
      phone_number: updatedEntity.phone_number,
      status: "ACTIVE",
      type: updatedEntity.type,
    })
  );
});
