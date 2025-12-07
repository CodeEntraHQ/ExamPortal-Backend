import Entity from "#models/entity.model.js";
import Media from "#models/media.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { constructMediaLink } from "#utils/utils.js";

export const createEntity = ApiHandler(async (req, res) => {
  // Parsing request
  const name = req.body.name?.trim();
  const address = req.body.address?.trim();
  const type = req.body.type?.trim();
  const description = req.body.description?.trim();
  const email = req.body.email?.trim();
  const phone_number = req.body.phone_number?.trim();
  const logo = req.file;

  // Check if entity exists
  const existingEntity = await Entity.findOne({ where: { name } });
  if (existingEntity) {
    throw new ApiError(
      409,
      "ENTITY_ALREADY_EXISTS",
      "Entity with this name already exists"
    );
  }

  let media;
  if (logo) {
    media = await Media.create({
      media: logo.buffer,
    });
  }

  // Create entity
  const entity = await Entity.create({
    name,
    address,
    type,
    description,
    email,
    phone_number,
    logo_id: media?.id,
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("ENTITY_ONBOARDED", {
      id: entity.id,
      address: entity.address,
      created_at: entity.created_at,
      description: entity.description,
      email: entity.email,
      logo_link: constructMediaLink(entity.logo_id),
      name: entity.name,
      phone_number: entity.phone_number,
      status: "ACTIVE",
      total_exams: 0,
      total_students: 0,
      type: entity.type,
      monitoring_enabled:
        entity.monitoring_enabled !== undefined
          ? entity.monitoring_enabled
          : true,
    })
  );
});
