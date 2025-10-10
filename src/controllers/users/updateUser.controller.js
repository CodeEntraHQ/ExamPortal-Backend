import Media from "#models/media.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { constructMediaLink } from "#utils/utils.js";

export const updateUser = ApiHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const address = req.body.address?.trim();
  const bio = req.body.bio?.trim();
  const profile_picture = req.file;

  if (req.user.profile_picture_id) {
    await Media.destroy({ where: { id: req.user.profile_picture_id } });
  }

  let media;
  if (profile_picture) {
    media = await Media.create({
      media: profile_picture,
    });
  }
  console.log(media);

  const updateData = {
    ...(name && { name }),
    ...(address && { address }),
    ...(bio && { bio }),
    ...(profile_picture && { profile_picture_id: media?.id }),
  };

  const user = await req.user.update(updateData);

  return res.status(200).json(
    new ApiResponse("USER_UPDATED", {
      id: user.id,
      address: user.address,
      bio: user.bio,
      created_at: user.created_at,
      email: user.email,
      name: user.name,
      phone_number: user.phone_number,
      profile_picture_link: constructMediaLink(user.profile_picture_id),
      role: user.role,
      status: user.status,
    })
  );
});
