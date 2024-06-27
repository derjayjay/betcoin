import { Router } from 'express';

import UserController from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/authentication.middleware';
import { userRouterRateLimiter } from '../middlewares/rateLimiting.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { loginSchema, profileSchema } from '../utils/schemas';

export const UserRouter: Router = (() => {
  const router = Router();

  router.use(userRouterRateLimiter);

  router.post('/register', validateBody(profileSchema), UserController.registerUser);
  router.post('/login', validateBody(loginSchema), UserController.loginUser);
  router.get('/auth/refresh', UserController.refreshToken);
  router.get('/auth/logout', authenticateToken, UserController.logoutUser);
  router.get('/profile', authenticateToken, UserController.getUserProfile);
  router.get('/game', authenticateToken, UserController.getUserGame);

  return router;
})();
