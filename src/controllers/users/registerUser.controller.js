import bcrypt from "bcrypt";

import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

export const registerUser = ApiHandler(async (req, res) => {
  // Parsing request
  const name = req.body.name?.trim();
  const password = req.body.password?.trim();

  // Hashing Password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user
  const user = await req.user.update({
    name,
    password_hash,
    status: "ACTIVE",
  });

  // Send response
  return res.status(200).json(
    new ApiResponse("USER_REGISTERED", {
      id: user.id,
      role: user.role,
    })
  );
});
