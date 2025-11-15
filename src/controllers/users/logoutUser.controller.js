import { ApiHandler } from "#utils/api-handler/handler.js";
import { ApiResponse } from "#utils/api-handler/response.js";

/**
 * Logout user
 * Note: Since we're using stateless JWT tokens, we can't truly invalidate them.
 * However, this endpoint serves as a way to:
 * 1. Log the logout event for audit purposes
 * 2. Allow the frontend to properly clean up
 * 3. In a production system, you might want to implement token blacklisting
 */
export const logoutUser = ApiHandler(async (req, res) => {
  // In a production system with token blacklisting, you would:
  // 1. Add the token to a blacklist (Redis, database, etc.)
  // 2. Check the blacklist in the authentication middleware
  // 3. Reject blacklisted tokens

  // For now, we just acknowledge the logout
  // The frontend will handle clearing local storage and tokens

  return res.status(200).json(
    new ApiResponse("LOGOUT_SUCCESSFUL", {
      message: "User logged out successfully",
    })
  );
});
