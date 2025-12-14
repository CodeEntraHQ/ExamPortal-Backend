import ExamMonitoring from "#models/examMonitoring.model.js";
import Media from "#models/media.model.js";

// Create a new monitoring record
export const createExamMonitoring = async (req, res, next) => {
  try {
    // Debug logging to help trace why records may not be saved
    try {
      console.info(
        "createExamMonitoring called by user:",
        req.user ? req.user.id : "anonymous"
      );
      console.info("Request body:", JSON.stringify(req.body));
    } catch (e) {
      console.info(
        e,
        "createExamMonitoring - failed to stringify request for logging"
      );
    }
    const {
      enrollment_id,
      switch_tab_count = 0,
      fullscreen_exit_count = 0,
      exam_start_media_id = null,
      metadata = null,
    } = req.body;

    if (!enrollment_id) {
      return res.status(400).json({ message: "enrollment_id is required" });
    }

    const record = await ExamMonitoring.create({
      enrollment_id,
      switch_tab_count,
      fullscreen_exit_count,
      exam_start_media_id,
      metadata,
    });

    console.info("ExamMonitoring created id=", record.id);

    return res.status(201).json(record);
  } catch (err) {
    console.error("createExamMonitoring error:", err);
    return next(err);
  }
};

// Get monitoring records by enrollment id
export const getMonitoringByEnrollment = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;

    const records = await ExamMonitoring.findAll({
      where: { enrollment_id: enrollmentId },
      order: [["created_at", "DESC"]],
    });

    // If media ids are present, optionally include basic media info
    const withMedia = await Promise.all(
      records.map(async (r) => {
        const rec = r.toJSON();
        if (rec.exam_start_media_id) {
          const m = await Media.findByPk(rec.exam_start_media_id);
          rec.exam_start_media = m ? { id: m.id } : null;
        }
        return rec;
      })
    );

    return res.json(withMedia);
  } catch (err) {
    return next(err);
  }
};
