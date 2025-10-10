import { Router } from "express";

import { getMedia } from "#controllers/medias/getMedia.controller.js";
import { verifyJWT } from "#middleware/authentication.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getMedia);

export default router;

// insert into "Users" (
// id,
// address,
// bio,
// created_at,
// email,
// entity_id,
// name,
// password_hash,
// phone_number,
// profile_picture_id,
// role,
// status
// ) values (
//     '30f2c46c-57b5-495e-83ba-5d3c1b887a35',
// '302 Classic Apartmentst 77',
//     'Heelo I am admin',
//     now(),
//     'rgautam1919@gmail.com',
//     'd5a79958-fd4b-4fab-91b7-3765cbb1aa48',
//     'Rishabh Gautam',
//     '$2b$10$HV1WsTcxODanrhh9nYdtAuZ358Djh2msuE0bHFVYz1lSGrHZTpQBy',
//     '7483305154',
//     null,
//     'SUPERADMIN',
//     'ACTIVE'
// )
