import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import { pino } from 'pino';

import { handleErrors } from './middlewares/errorHandling.middleware';
import { commonRateLimiter } from './middlewares/rateLimiting.middleware';
import { BetRouter } from './routes/bet.router';
import { HealthRouter } from './routes/health.router';
import { PriceRouter } from './routes/price.router';
import { UserRouter } from './routes/user.router';
import config from './utils/config';

const app: Express = express();
const logger = pino({ name: config.SERVER_NAME, level: config.LOG_LEVEL });

// Add various required middleware
app.use(express.json());
app.use(cookieParser());

// Add rate limiting and helmet middleware for security, if not running in dev mode
if (!config.isDev) {
  app.use(helmet());
  app.use(commonRateLimiter);
}

// Add CORS policy
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST'],
  })
);

// Trust the reverse proxy
if (config.TRUST_REVERSE_PROXY) {
  app.set('trust proxy', true);
}

// Add error handler for unexpteced errors
app.use(handleErrors);

// Import routers
app.use('/user', UserRouter);
app.use('/bets', BetRouter);
app.use('/price', PriceRouter);
app.use('/health', HealthRouter);

export { app, logger };
