import { Router } from 'express';

import PriceController from '../controllers/price.controller';
import { authenticateToken } from '../middlewares/authentication.middleware';

export const PriceRouter: Router = (() => {
  const router = Router();

  router.get('/btc', authenticateToken, PriceController.getBtcPrice);

  return router;
})();
