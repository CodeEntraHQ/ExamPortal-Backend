import Media from "#models/media.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

// Accepts multipart/form-data field `media` (file) or legacy JSON dataURL in req.body.media.
export const saveMedia = ApiHandler(async (req, res) => {
  let buffer = null;
  let mime_type = null;
  let exam_id = null;
  let metadata = null;

  // If multer provided a file
  if (req.file && req.file.buffer) {
    buffer = req.file.buffer;
    mime_type = req.file.mimetype;
    exam_id = req.body?.exam_id || null;
    try {
      metadata = req.body?.metadata ? JSON.parse(req.body.metadata) : null;
    } catch (e) {
      console.info(e, "saveMedia - failed to parse metadata");
      metadata = req.body?.metadata || null;
    }
  } else {
    // fallback to legacy base64 dataURL payload in JSON
    const {
      media: mediaDataUrl,
      mime_type: mt,
      exam_id: eid,
      metadata: meta,
    } = req.body || {};

    if (!mediaDataUrl) {
      throw new ApiError(
        400,
        "MEDIA_REQUIRED",
        "Media data is required either as file upload or data URL"
      );
    }

    const parts = String(mediaDataUrl).split(",");
    if (parts.length < 2) {
      throw new ApiError(
        400,
        "INVALID_MEDIA",
        "Media must be a data URL with base64 encoded payload"
      );
    }

    const base64 = parts.slice(1).join(",");
    buffer = Buffer.from(base64, "base64");
    mime_type = mt || parts[0].split(":")[1] || null;
    exam_id = eid || null;
    try {
      metadata = typeof meta === "string" ? JSON.parse(meta) : meta;
    } catch (e) {
      console.info(e, "saveMedia - failed to parse metadata");
      metadata = meta || null;
    }
  }

  const record = await Media.create({
    media: buffer,
    user_id: req.user?.id || null,
    exam_id: exam_id || null,
    mime_type: mime_type || null,
    metadata: metadata || null,
    uploaded_at: new Date(),
  });

  return res
    .status(201)
    .json(new ApiResponse("MEDIA_SAVED", { id: record.id }));
});
