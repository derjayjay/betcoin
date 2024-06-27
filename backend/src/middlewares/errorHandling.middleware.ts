import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { logger } from '../app';

export const handleErrors: ErrorRequestHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(error.name, 'An unexpected error occurred.');
  logger.debug({ message: error.message, stack: error.stack }, 'Error details are provided below.');
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Something went wrong');
};
