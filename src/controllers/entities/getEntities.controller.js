import Entity from "#models/entity.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getEntities = ApiHandler(async (req, res) => {
  // Parsing request
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Fetch entity
  const { rows: entities, count: total } = await Entity.findAndCountAll({
    offset,
    limit,
    attributes: ["id", "name", "address", "type"],
    order: [["created_at", "ASC"]],
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("ENTITIES_FETCHED", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      entities,
    })
  );
});
