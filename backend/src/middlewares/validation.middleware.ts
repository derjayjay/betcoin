import { NextFunction, Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

import { logger } from '../app';

export const validateBody: (schema: Joi.ObjectSchema) => RequestHandler = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      logger.debug(error, 'Validating request body failed');
      return res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
    }
    next();
  };
};

export const validateParameters: (schema: Joi.ObjectSchema) => RequestHandler = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params);
    if (error) {
      logger.debug(error, 'Validating request parameters failed');
      return res.status(StatusCodes.BAD_REQUEST).json({ error: error.details[0].message });
    }
    next();
  };
};
