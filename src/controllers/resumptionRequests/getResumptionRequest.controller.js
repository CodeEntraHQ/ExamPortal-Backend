import Enrollment from "#models/enrollment.model.js";
import ResumptionRequest from "#models/resumptionRequest.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getResumptionRequest = ApiHandler(async (req, res) => {
  const { enrollment_id } = req.params;

  if (!enrollment_id) {
    throw new ApiError(400, "BAD_REQUEST", "enrollment_id is required");
  }

  // Find enrollment
  const enrollment = await Enrollment.findByPk(enrollment_id);
  if (!enrollment) {
    throw new ApiError(404, "NOT_FOUND", "Enrollment not found");
  }

  // Verify enrollment belongs to the requesting user (for students)
  if (req.user.role === "STUDENT" && enrollment.user_id !== req.user.id) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You can only view resumption requests for your own enrollments"
    );
  }

  // Find the most recent resumption request
  const resumptionRequest = await ResumptionRequest.findOne({
    where: { enrollment_id },
    order: [["requested_at", "DESC"]],
  });

  if (!resumptionRequest) {
    return res.status(200).json(
      new ApiResponse("NO_RESUMPTION_REQUEST", {
        has_request: false,
      })
    );
  }

  return res.status(200).json(
    new ApiResponse("RESUMPTION_REQUEST_FETCHED", {
      request_id: resumptionRequest.id,
      status: resumptionRequest.status,
      requested_at: resumptionRequest.requested_at,
      approved_at: resumptionRequest.approved_at,
      rejected_at: resumptionRequest.rejected_at,
      rejection_reason: resumptionRequest.rejection_reason,
      has_request: true,
    })
  );
});
