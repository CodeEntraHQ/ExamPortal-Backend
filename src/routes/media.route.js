import { Router } from "express";

import { getMedia } from "#controllers/medias/getMedia.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getMedia);

export default router;
