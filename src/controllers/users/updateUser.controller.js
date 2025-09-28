import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const updateUser = ApiHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const profilePicture = req.file;
  const updateData = {};

  if (name) {
    updateData.name = name;
  }

  if (profilePicture) {
    updateData.profile_picture = profilePicture.buffer;
  }
  const user = await req.user.update(updateData);

  return res.status(200).json(
    new ApiResponse("USER_UPDATED", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_picture: user.profile_picture,
      created_at: user.created_at,
    })
  );
});
