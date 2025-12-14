import Enrollment from "#models/enrollment.model.js";
import ExamMonitoring from "#models/examMonitoring.model.js";
import User from "#models/user.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

// Create or update monitoring record (upsert by enrollment_id)
export const createOrUpdateExamMonitoring = ApiHandler(async (req, res) => {
  const {
    enrollment_id,
    tab_switch_count,
    fullscreen_exit_count,
    snapshot_media_id,
    snapshot_type, // 'regular_interval' | 'multiple_face_detection' | 'no_face_detection' | 'exam_start'
  } = req.body;

  if (!enrollment_id) {
    throw new ApiError(400, "BAD_REQUEST", "enrollment_id is required");
  }

  // Find existing monitoring record or create new one
  let monitoring = await ExamMonitoring.findOne({
    where: { enrollment_id },
  });

  // Initialize or get existing metadata - deep clone to avoid mutating original
  let metadata = monitoring?.metadata
    ? JSON.parse(JSON.stringify(monitoring.metadata)) // Deep clone existing metadata
    : {
        snapshots: {
          regular_interval: [],
          multiple_face_detection: [],
          no_face_detection: [],
          exam_start: null,
        },
      };

  // Ensure snapshots structure exists
  if (!metadata.snapshots) {
    metadata.snapshots = {
      regular_interval: [],
      multiple_face_detection: [],
      no_face_detection: [],
      exam_start: null,
    };
  }

  // Ensure all snapshot arrays exist
  if (!metadata.snapshots.regular_interval)
    metadata.snapshots.regular_interval = [];
  if (!metadata.snapshots.multiple_face_detection)
    metadata.snapshots.multiple_face_detection = [];
  if (!metadata.snapshots.no_face_detection)
    metadata.snapshots.no_face_detection = [];
  if (metadata.snapshots.exam_start === undefined)
    metadata.snapshots.exam_start = null;

  // Update counts if provided
  const updateData = {};
  if (tab_switch_count !== undefined) {
    updateData.tab_switch_count = tab_switch_count;
  }
  if (fullscreen_exit_count !== undefined) {
    updateData.fullscreen_exit_count = fullscreen_exit_count;
  }

  // Add snapshot to metadata if provided
  if (snapshot_media_id && snapshot_type) {
    if (snapshot_type === "exam_start") {
      metadata.snapshots.exam_start = snapshot_media_id;
    } else if (
      [
        "regular_interval",
        "multiple_face_detection",
        "no_face_detection",
      ].includes(snapshot_type)
    ) {
      if (!Array.isArray(metadata.snapshots[snapshot_type])) {
        metadata.snapshots[snapshot_type] = [];
      }
      // Avoid duplicates
      if (!metadata.snapshots[snapshot_type].includes(snapshot_media_id)) {
        metadata.snapshots[snapshot_type].push(snapshot_media_id);
      }
    }
  }

  // Always include metadata in update to ensure it's persisted
  // This preserves existing snapshots when only counts are being updated
  updateData.metadata = metadata;

  if (monitoring) {
    // Update existing record - merge with existing values if not provided
    const finalUpdateData = {
      ...updateData,
      tab_switch_count:
        tab_switch_count !== undefined
          ? tab_switch_count
          : monitoring.tab_switch_count,
      fullscreen_exit_count:
        fullscreen_exit_count !== undefined
          ? fullscreen_exit_count
          : monitoring.fullscreen_exit_count,
    };
    await monitoring.update(finalUpdateData);
    // Reload to get updated data
    await monitoring.reload();
  } else {
    // Create new record
    monitoring = await ExamMonitoring.create({
      enrollment_id,
      tab_switch_count: tab_switch_count !== undefined ? tab_switch_count : 0,
      fullscreen_exit_count:
        fullscreen_exit_count !== undefined ? fullscreen_exit_count : 0,
      metadata: updateData.metadata,
    });
  }

  return res.status(200).json(
    new ApiResponse("MONITORING_UPDATED", {
      id: monitoring.id,
      enrollment_id: monitoring.enrollment_id,
      tab_switch_count: monitoring.tab_switch_count,
      fullscreen_exit_count: monitoring.fullscreen_exit_count,
      metadata: monitoring.metadata,
    })
  );
});

// Legacy create endpoint (for backward compatibility)
export const createExamMonitoring = ApiHandler(async (req, res) => {
  return createOrUpdateExamMonitoring(req, res);
});

// Get monitoring record by enrollment id
export const getMonitoringByEnrollment = ApiHandler(async (req, res) => {
  const { enrollmentId } = req.params;

  if (!enrollmentId) {
    throw new ApiError(400, "BAD_REQUEST", "enrollmentId is required");
  }

  const monitoring = await ExamMonitoring.findOne({
    where: { enrollment_id: enrollmentId },
    order: [["created_at", "DESC"]],
  });

  if (!monitoring) {
    return res.status(200).json(
      new ApiResponse("MONITORING_FETCHED", {
        enrollment_id: enrollmentId,
        tab_switch_count: 0,
        fullscreen_exit_count: 0,
        metadata: {
          snapshots: {
            regular_interval: [],
            multiple_face_detection: [],
            no_face_detection: [],
            exam_start: null,
          },
        },
      })
    );
  }

  return res.status(200).json(
    new ApiResponse("MONITORING_FETCHED", {
      id: monitoring.id,
      enrollment_id: monitoring.enrollment_id,
      tab_switch_count: monitoring.tab_switch_count,
      fullscreen_exit_count: monitoring.fullscreen_exit_count,
      metadata: monitoring.metadata,
      created_at: monitoring.created_at,
      updated_at: monitoring.updated_at,
    })
  );
});

// Get all monitoring data for an exam (by exam_id)
export const getMonitoringByExam = ApiHandler(async (req, res) => {
  const { examId } = req.params;

  if (!examId) {
    throw new ApiError(400, "BAD_REQUEST", "examId is required");
  }

  // Get all enrollments for this exam
  const enrollments = await Enrollment.findAll({
    where: { exam_id: examId },
    attributes: [
      "id",
      "user_id",
      "exam_id",
      "status",
      "metadata",
      "created_at",
    ],
  });

  if (enrollments.length === 0) {
    return res.status(200).json(
      new ApiResponse("EXAM_MONITORING_FETCHED", {
        exam_id: examId,
        enrollments: [],
      })
    );
  }

  const enrollmentIds = enrollments.map((e) => e.id);
  const userIds = [...new Set(enrollments.map((e) => e.user_id))];

  // Get all monitoring records for these enrollments
  const monitoringRecords = await ExamMonitoring.findAll({
    where: { enrollment_id: enrollmentIds },
    order: [["created_at", "DESC"]],
  });

  // Get user details
  const users = await User.findAll({
    where: { id: userIds },
    attributes: ["id", "name", "email", "roll_number"],
  });

  const userMap = new Map(users.map((u) => [u.id, u]));
  const monitoringMap = new Map(
    monitoringRecords.map((m) => [m.enrollment_id, m])
  );

  // Combine enrollment, user, and monitoring data
  const enrollmentMonitoringData = enrollments.map((enrollment) => {
    const monitoring = monitoringMap.get(enrollment.id);
    const user = userMap.get(enrollment.user_id);

    return {
      enrollment_id: enrollment.id,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            roll_number: user.roll_number,
          }
        : null,
      enrollment_status: enrollment.status,
      enrollment_created_at: enrollment.created_at,
      monitoring: monitoring
        ? {
            id: monitoring.id,
            tab_switch_count: monitoring.tab_switch_count,
            fullscreen_exit_count: monitoring.fullscreen_exit_count,
            metadata: monitoring.metadata || {
              snapshots: {
                regular_interval: [],
                multiple_face_detection: [],
                no_face_detection: [],
                exam_start: null,
              },
            },
            created_at: monitoring.created_at,
            updated_at: monitoring.updated_at,
          }
        : {
            tab_switch_count: 0,
            fullscreen_exit_count: 0,
            metadata: {
              snapshots: {
                regular_interval: [],
                multiple_face_detection: [],
                no_face_detection: [],
                exam_start: null,
              },
            },
          },
    };
  });

  return res.status(200).json(
    new ApiResponse("EXAM_MONITORING_FETCHED", {
      exam_id: examId,
      enrollments: enrollmentMonitoringData,
      total_enrollments: enrollments.length,
      total_with_monitoring: monitoringRecords.length,
    })
  );
});
