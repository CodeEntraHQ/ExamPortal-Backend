import Enrollment from "#models/enrollment.model.js";
import ResumptionRequest, {
  RESUMPTION_REQUEST_STATUS,
} from "#models/resumptionRequest.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getPendingResumptionRequests = ApiHandler(async (req, res) => {
  const { exam_id } = req.params;

  if (!exam_id) {
    throw new ApiError(400, "BAD_REQUEST", "exam_id is required");
  }

  // Verify user is admin or superadmin
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only admins can view pending resumption requests"
    );
  }

  // Find all enrollments for this exam
  const enrollments = await Enrollment.findAll({
    where: { exam_id },
    attributes: ["id"],
  });

  const enrollmentIds = enrollments.map((e) => e.id);

  if (enrollmentIds.length === 0) {
    return res.status(200).json(
      new ApiResponse("PENDING_RESUMPTION_REQUESTS_FETCHED", {
        requests: [],
      })
    );
  }

  // Find pending resumption requests for these enrollments
  const requests = await ResumptionRequest.findAll({
    where: {
      enrollment_id: enrollmentIds,
      status: RESUMPTION_REQUEST_STATUS.PENDING,
    },
    order: [["requested_at", "DESC"]],
  });

  // Fetch enrollments and users separately
  const enrollmentIdsFromRequests = requests.map((r) => r.enrollment_id);
  const enrollmentsWithUsers = await Enrollment.findAll({
    where: { id: enrollmentIdsFromRequests },
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
    ],
  });

  const enrollmentMap = new Map(enrollmentsWithUsers.map((e) => [e.id, e]));

  const formattedRequests = requests.map((request) => {
    const enrollment = enrollmentMap.get(request.enrollment_id);
    return {
      id: request.id,
      enrollment_id: request.enrollment_id,
      status: request.status,
      requested_at: request.requested_at,
      user: enrollment?.User
        ? {
            id: enrollment.User.id,
            name: enrollment.User.name,
            email: enrollment.User.email,
          }
        : null,
    };
  });

  return res.status(200).json(
    new ApiResponse("PENDING_RESUMPTION_REQUESTS_FETCHED", {
      requests: formattedRequests,
    })
  );
});
