import College from "#models/college.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiHandler } from "#utils/api-handler/handler.js";

export const getColleges = ApiHandler(async (req, res) => {
  // Check if user is SUPERADMIN
  if (req.user.role !== "SUPERADMIN") {
    throw new ApiError(401, "AUTHENTICATION_FAILED");
  }

  // Parsing request
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Fetch college
  const { rows: colleges, count: total } = await College.findAndCountAll({
    offset,
    limit,
    attributes: ["id", "name", "address"],
    order: [["created_at", "ASC"]],
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("COLLEGES_FETCHED", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      colleges,
    })
  );
});
