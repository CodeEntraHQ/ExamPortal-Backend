import { Router } from "express";
import multer from "multer";

import { createEntity } from "#controllers/entities/createEntity.controller.js";
import { createTrialEntity } from "#controllers/entities/createTrialEntity.controller.js";
import { getEntities } from "#controllers/entities/getEntities.controller.js";
import { getEntityById } from "#controllers/entities/getEntityById.controller.js";
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
import { createTrialEntitySchema } from "#validations/trialEntity.validation.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fields: [
    { name: "logo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ],
});

router
  .route("/")
  .get(
    validate(getEntitiesSchema),
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN),
    getEntities
  );

// Public trial entity creation endpoint (no auth required)
router
  .route("/trial")
  .post(
    upload.fields([{ name: "logo", maxCount: 1 }]),
    validate(createTrialEntitySchema),
    createTrialEntity
  );

// Regular entity creation (requires SUPERADMIN auth)
router.route("/").post(
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  validate(createEntitySchema),
  verifyJWT,
  checkAuthorization(USER_ROLES.SUPERADMIN),
  createEntity
);

router.route("/").patch(
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  validate(updateEntitySchema),
  verifyJWT,
  checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  updateEntity
);

// Get entity by ID - allows ADMIN to get their own entity
router
  .route("/:id")
  .get(
    verifyJWT,
    checkAuthorization(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
    getEntityById
  );

export default router;
