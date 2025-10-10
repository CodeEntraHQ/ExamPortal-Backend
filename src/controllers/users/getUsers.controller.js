import User from "#models/user.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { constructMediaLink } from "#utils/utils.js";

export const getUsers = ApiHandler(async (req, res) => {
  // Parsing request
  const entity_id = req.query.entity_id?.trim();
  const role = req.query.role?.trim();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Fetch users
  const { rows, count: total } = await User.findAndCountAll({
    where: { role: role, entity_id: entity_id },
    offset,
    limit,
    order: [["created_at", "ASC"]],
  });

  const updatedRows = rows.map((user) => {
    // eslint-disable-next-line no-unused-vars
    const { password_hash, profile_picture_id, ...rest } = user.toJSON();
    return {
      ...rest,
      profile_picture_link: constructMediaLink(profile_picture_id),
    };
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("USERS_FETCHED", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      users: updatedRows,
    })
  );
});
