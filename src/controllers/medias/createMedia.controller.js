import Media from "#models/media.model.js";

// Create media from uploaded file in memory
export const createMedia = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "file is required" });
    }

    const mediaRecord = await Media.create({
      media: req.file.buffer,
    });

    return res.status(201).json({ id: mediaRecord.id });
  } catch (err) {
    console.error("createMedia error:", err);
    return next(err);
  }
};
