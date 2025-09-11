import College from "#models/college.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const updateCollege = ApiHandler(async (req, res) => {
  // Parsing request
  const { college_id, name, address } = req.body;

  // Request assertion
  if (!college_id || (!name && !address)) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "college_id and either name or address is required"
    );
  }

  const updateData = {
    ...(name && { name }),
    ...(address && { address }),
  };

  // Update college
  const [updatedCount, updatedCollege] = await College.update(updateData, {
    where: { id: college_id },
    returning: true,
  });

  // Check if no college is updated
  if (updatedCount === 0) {
    throw new ApiError(400, "COLLEGE_NOT_FOUND", "College not found");
  }

  // Send response
  return res.status(200).json(
    new ApiResponse("COLLEGE_UPDATED", {
      id: updatedCollege[0].id,
      name: updatedCollege[0].name,
      address: updatedCollege[0].address,
    })
  );
});
