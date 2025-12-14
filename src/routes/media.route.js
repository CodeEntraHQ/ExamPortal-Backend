import { Router } from "express";
import multer from "multer";

import { createMedia } from "#controllers/medias/createMedia.controller.js";
import { getMedia } from "#controllers/medias/getMedia.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET returns media (requires auth)
router.route("/").get(verifyJWT, getMedia);

// POST upload media as multipart/form-data (field name: file)
router.route("/").post(verifyJWT, upload.single("file"), createMedia);

export default router;
