import { Router } from "express";
import multer from "multer";

import { createEntity } from "#controllers/entities/createEntity.controller.js";
import { getEntities } from "#controllers/entities/getEntities.controller.js";
import { updateEntity } from "#controllers/entities/updateEntity.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";
import { checkAuthorization } from "#middleware/authorization.middleware.js";
import { validate } from "#middleware/validation.middleware.js";
import { USER_ROLES } from "#utils/constants/model.constant.js";
import {
  getEntitiesSchema,
  createEntitySchema,
  updateEntitySchema,
} from "#validations/entity.validation.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
  .route("/")
  .get(
    validate(getEntitiesSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN),
    getEntities
  );

router
  .route("/")
  .post(
    upload.single("logo"),
    validate(createEntitySchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN),
    createEntity
  );

router
  .route("/")
  .patch(
    upload.single("logo"),
    validate(updateEntitySchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN),
    updateEntity
  );

export default router;
