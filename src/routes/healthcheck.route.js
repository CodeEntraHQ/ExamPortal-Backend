import { Router } from 'express';
import { getAppHealth, getDBHealth } from '../controllers/healthcheck.controller.js';

const router = Router();

router.get('/app', getAppHealth);
router.get('/db', getDBHealth);

export default router;
