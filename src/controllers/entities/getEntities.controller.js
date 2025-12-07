import Entity from "#models/entity.model.js";
import Exam from "#models/exam.model.js";
import User from "#models/user.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";
import { constructMediaLink } from "#utils/utils.js";

export const getEntities = ApiHandler(async (req, res) => {
  // Parsing request
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Fetch entity
  const { rows, count: total } = await Entity.findAndCountAll({
    offset,
    limit,
    order: [["created_at", "ASC"]],
  });

  const updatedRows = await Promise.all(
    rows.map(async (entity) => ({
      id: entity.id,
      address: entity.address,
      created_at: entity.created_at,
      description: entity.description,
      email: entity.email,
      logo_link: constructMediaLink(entity.logo_id),
      name: entity.name,
      phone_number: entity.phone_number,
      status: "ACTIVE",
      total_exams: await Exam.count({ where: { entity_id: entity.id } }),
      total_students: await User.count({
        where: { entity_id: entity.id, role: USER_ROLES.STUDENT },
      }),
      type: entity.type,
      monitoring_enabled:
        entity.monitoring_enabled !== undefined
          ? entity.monitoring_enabled
          : true,
    }))
  );

  // Send response
  return res.status(200).json(
    new ApiResponse("ENTITIES_FETCHED", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      entities: updatedRows,
    })
  );
});
