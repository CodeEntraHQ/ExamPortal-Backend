import College from "#models/college.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ApiHandler } from "#utils/api-handler/handler.js";

export const createCollege = ApiHandler(async (req, res) => {
  // Check if user is SUPERADMIN
  if (req.user.role !== "SUPERADMIN") {
    throw new ApiError(403, "AUTHORIZATION_FAILED", "User is not a SUPERADMIN");
  }

  // Parsing request
  const { name, address } = req.body;

  // Request assertion
  if ([name, address].some((field) => !field || String(field).trim() === "")) {
    throw new ApiError(400, "BAD_REQUEST", "Name and address are required");
  }

  // Check if college exists
  const existingCollege = await College.findOne({ where: { name } });
  if (existingCollege) {
    throw new ApiError(
      409,
      "COLLEGE_ALREADY_EXISTS",
      "College with this name already exists"
    );
  }

  // Create college
  const college = await College.create({
    name,
    address,
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("COLLEGE_ONBOARDED", {
      id: college.id,
      name: college.name,
      address: college.address,
    })
  );
});
