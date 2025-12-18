import ResumptionRequest, {
  RESUMPTION_REQUEST_STATUS,
} from "#models/resumptionRequest.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const rejectResumption = ApiHandler(async (req, res) => {
  const { request_id, rejection_reason } = req.body;

  if (!request_id) {
    throw new ApiError(400, "BAD_REQUEST", "request_id is required");
  }

  // Verify user is admin or superadmin
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only admins can reject resumption requests"
    );
  }

  // Find resumption request
  const resumptionRequest = await ResumptionRequest.findByPk(request_id);
  if (!resumptionRequest) {
    throw new ApiError(404, "NOT_FOUND", "Resumption request not found");
  }

  // Check if already processed
  if (resumptionRequest.status !== RESUMPTION_REQUEST_STATUS.PENDING) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      `Resumption request has already been ${resumptionRequest.status.toLowerCase()}`
    );
  }

  // Update request status
  await resumptionRequest.update({
    status: RESUMPTION_REQUEST_STATUS.REJECTED,
    rejected_at: new Date(),
    rejection_reason: rejection_reason || null,
  });

  return res.status(200).json(
    new ApiResponse("RESUMPTION_REJECTED", {
      request_id: resumptionRequest.id,
      status: resumptionRequest.status,
      rejected_at: resumptionRequest.rejected_at,
      rejection_reason: resumptionRequest.rejection_reason,
      enrollment_id: resumptionRequest.enrollment_id,
    })
  );
});
