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
    return {
      id: user.id,
      address: user.address,
      bio: user.bio,
      created_at: user.created_at,
      email: user.email,
      two_fa_enabled: user.two_fa_enabled,
      gender: user.gender,
      last_login_at: user.last_login_at,
      name: user.name,
      phone_number: user.phone_number,
      profile_picture_link: constructMediaLink(user.profile_picture_id),
      role: user.role,
      roll_number: user.roll_number,
      status: user.status,
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
