import Media from "#models/media.model.js";
import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";
import { constructMediaLink } from "#utils/utils.js";

export const updateUser = ApiHandler(async (req, res) => {
  // Parsing request
  const address = req.body.address?.trim();
  const bio = req.body.bio?.trim();
  const gender = req.body.gender?.trim();
  // Phone number can be a number (after validation coercion) or string, convert to string for storage
  const phone_number = req.body.phone_number
    ? typeof req.body.phone_number === "number"
      ? String(req.body.phone_number)
      : req.body.phone_number.trim()
    : null;
  const roll_number = req.body.roll_number?.trim();
  const name = req.body.name?.trim();
  const profile_picture = req.file;

  // Only delete old media if a new picture is being uploaded
  let media;
  if (profile_picture) {
    // Delete old media before creating new one
    if (req.user.profile_picture_id) {
      await Media.destroy({ where: { id: req.user.profile_picture_id } });
    }

    media = await Media.create({
      media: profile_picture.buffer,
    });
  }

  const updateData = {};
  if (address !== undefined && address !== null && address !== "") {
    updateData.address = address;
  }
  if (bio !== undefined && bio !== null && bio !== "") {
    updateData.bio = bio;
  }
  if (gender !== undefined && gender !== null && gender !== "") {
    updateData.gender = gender;
  }
  if (roll_number !== undefined && roll_number !== null && roll_number !== "") {
    updateData.roll_number = roll_number;
  }
  if (
    phone_number !== undefined &&
    phone_number !== null &&
    phone_number !== ""
  ) {
    updateData.phone_number = phone_number;
  }
  if (name !== undefined && name !== null && name !== "") {
    updateData.name = name;
  }
  if (profile_picture && media) {
    updateData.profile_picture_id = media.id;
  }

  const user = await req.user.update(updateData);

  return res.status(200).json(
    new ApiResponse("USER_UPDATED", {
      id: user.id,
      address: user.address,
      bio: user.bio,
      created_at: user.created_at,
      email: user.email,
      two_fa_enabled: user.two_fa_enabled,
      gender: user.gender,
      last_login_at: user.last_login_at,
      name: user.name,
      phone_number: user.phone_number,
      profile_picture_link: constructMediaLink(user.profile_picture_id),
      role: user.role,
      roll_number: user.roll_number,
      status: user.status,
    })
  );
});
