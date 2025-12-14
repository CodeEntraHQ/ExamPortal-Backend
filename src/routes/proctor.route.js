import { Router } from "express";
import multer from "multer";

import { saveMedia } from "#controllers/medias/saveMedia.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";
import { uploadRateLimit } from "#middleware/uploadRateLimit.middleware.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/upload",
  verifyJWT,
  uploadRateLimit({ limit: 12, windowMs: 60 * 1000 }),
  upload.single("media"),
  saveMedia
);

export default router;
