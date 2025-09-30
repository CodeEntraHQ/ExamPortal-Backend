import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

import { getLeaderboard } from "../controllers/leaderboard.controller.js";

const router = Router();

router.route("/scoreboard").get(verifyJWT, getLeaderboard);

export default router;
