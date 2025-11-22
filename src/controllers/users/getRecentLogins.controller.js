import { Op } from "sequelize";

import Entity from "#models/entity.model.js";
import User from "#models/user.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { constructMediaLink } from "#utils/utils.js";

export const getRecentLogins = ApiHandler(async (req, res) => {
  // Get top 5 users with recent logins, ordered by last_login_at descending
  const users = await User.findAll({
    where: {
      last_login_at: {
        [Op.ne]: null, // Only users who have logged in
      },
    },
    include: [
      {
        model: Entity,
        attributes: ["id", "name"],
        required: false,
      },
    ],
    order: [["last_login_at", "DESC"]],
    limit: 5,
  });

  const recentLogins = users.map((user) => {
    return {
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      role: user.role,
      entity_name: user.Entity?.name || "N/A",
      last_login_at: user.last_login_at,
      profile_picture_link: constructMediaLink(user.profile_picture_id),
    };
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("RECENT_LOGINS_FETCHED", {
      recentLogins,
    })
  );
});
