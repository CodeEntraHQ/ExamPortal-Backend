import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getUsers = ApiHandler(async (req, res) => {
  // Parsing request
  const college_id = req.query.college_id;
  const role = req.query.role;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Request assertion
  if (
    [college_id, role].some((field) => !field || String(field).trim() === "")
  ) {
    throw new ApiError(400, "BAD_REQUEST", "Missing required fields");
  }

  if (role === "SUPERADMIN") {
    throw new ApiError(400, "BAD_REQUEST", "superadmin is not allowed");
  }

  // Fetch users
  const { rows, count: total } = await User.findAndCountAll({
    where: { role: role, entity_id: college_id },
    offset,
    limit,
    attributes: ["id", "name", "email", "role", "status"],
    order: [["created_at", "ASC"]],
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("USERS_FETCHED", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      users: rows,
    })
  );
});
