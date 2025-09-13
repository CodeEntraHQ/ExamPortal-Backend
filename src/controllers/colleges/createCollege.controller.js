import College from "#models/college.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const createCollege = ApiHandler(async (req, res) => {
  // Parsing request
  const name = req.body.name?.trim();
  const address = req.body.address?.trim();

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
