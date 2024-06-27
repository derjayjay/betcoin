import { Router } from 'express';

import BetController from '../controllers/bet.controller';
import { authenticateToken } from '../middlewares/authentication.middleware';
import { validateBody, validateParameters } from '../middlewares/validation.middleware';
import { betSchema, idParameterScheme } from '../utils/schemas';

export const BetRouter: Router = (() => {
  const router = Router();

  router.get('/:id', authenticateToken, validateParameters(idParameterScheme), BetController.getBet);
  router.post('/submit', authenticateToken, validateBody(betSchema), BetController.submitBet);

  return router;
})();
