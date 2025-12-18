import Enrollment from "#models/enrollment.model.js";
import ResumptionRequest, {
  RESUMPTION_REQUEST_STATUS,
} from "#models/resumptionRequest.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const invalidateResumptionRequest = ApiHandler(async (req, res) => {
  const { enrollment_id } = req.body;

  if (!enrollment_id) {
    throw new ApiError(400, "BAD_REQUEST", "enrollment_id is required");
  }

  // Find enrollment
  const enrollment = await Enrollment.findByPk(enrollment_id);
  if (!enrollment) {
    throw new ApiError(404, "NOT_FOUND", "Enrollment not found");
  }

  // Verify enrollment belongs to the requesting user
  if (enrollment.user_id !== req.user.id) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You can only invalidate resumption requests for your own enrollments"
    );
  }

  // Find and delete approved resumption request for this enrollment
  const approvedRequest = await ResumptionRequest.findOne({
    where: {
      enrollment_id,
      status: RESUMPTION_REQUEST_STATUS.APPROVED,
    },
  });

  if (approvedRequest) {
    await approvedRequest.destroy();
    return res.status(200).json(
      new ApiResponse("RESUMPTION_REQUEST_INVALIDATED", {
        message:
          "Approved resumption request has been invalidated. A new request will be required to resume the exam.",
      })
    );
  }

  // If no approved request found, return success anyway (idempotent)
  return res.status(200).json(
    new ApiResponse("NO_APPROVED_REQUEST_FOUND", {
      message: "No approved resumption request found to invalidate.",
    })
  );
});
