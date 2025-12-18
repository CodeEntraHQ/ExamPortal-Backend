import Enrollment from "#models/enrollment.model.js";
import ResumptionRequest, {
  RESUMPTION_REQUEST_STATUS,
} from "#models/resumptionRequest.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { ENROLLMENT_STATUS } from "#utils/constants/model.constant.js";

export const requestResumption = ApiHandler(async (req, res) => {
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
      "You can only request resumption for your own enrollments"
    );
  }

  // Check if enrollment is in ONGOING status
  if (enrollment.status !== ENROLLMENT_STATUS.ONGOING) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Resumption can only be requested for ongoing exams"
    );
  }

  // Check if there's already a pending request
  const existingRequest = await ResumptionRequest.findOne({
    where: {
      enrollment_id,
      status: RESUMPTION_REQUEST_STATUS.PENDING,
    },
  });

  if (existingRequest) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "A resumption request is already pending for this enrollment"
    );
  }

  // Check if there's an approved request
  const approvedRequest = await ResumptionRequest.findOne({
    where: {
      enrollment_id,
      status: RESUMPTION_REQUEST_STATUS.APPROVED,
    },
  });

  if (approvedRequest) {
    return res.status(200).json(
      new ApiResponse("RESUMPTION_ALREADY_APPROVED", {
        request_id: approvedRequest.id,
        status: approvedRequest.status,
        approved_at: approvedRequest.approved_at,
      })
    );
  }

  // Create new resumption request
  const resumptionRequest = await ResumptionRequest.create({
    enrollment_id,
    status: RESUMPTION_REQUEST_STATUS.PENDING,
    requested_at: new Date(),
  });

  return res.status(201).json(
    new ApiResponse("RESUMPTION_REQUESTED", {
      request_id: resumptionRequest.id,
      status: resumptionRequest.status,
      requested_at: resumptionRequest.requested_at,
    })
  );
});
