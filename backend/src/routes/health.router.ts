import { Router } from 'express';

import HealthController from '../controllers/health.controller';

export const HealthRouter: Router = (() => {
  const router = Router();

  router.get('/isAlive', HealthController.isAlive);

  return router;
})();
