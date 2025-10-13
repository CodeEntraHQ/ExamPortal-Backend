import Media from "#models/media.model.js";
import { ApiError } from "#utils/api-handler/error.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const getMedia = ApiHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError(400, "Media ID is required");
  }

  const media = await Media.findByPk(id);

  if (!media) {
    throw new ApiError(404, "Media not found");
  }

  return res.status(200).json(
    new ApiResponse("MEDIA_FETCHED", {
      id: media.id,
      media: media.media,
    })
  );
});
