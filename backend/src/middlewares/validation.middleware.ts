import { NextFunction, Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

import { logger } from '../app';
import config from '../utils/config';

/**
 * Validates the request body against the provided schema.
 * If the validation fails, it sends a response with a status code BAD_REQUEST.
 *
 * @param schema - The Joi schema used for validation.
 */
export const validateBody: (schema: Joi.ObjectSchema) => RequestHandler = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      logger.debug(error, 'Validating request body failed');
      return res.status(StatusCodes.BAD_REQUEST).json(config.isProduction ? {} : { error: error.details[0].message });
    }
    next();
  };
};

/**
 * Validates the request parameters against the provided schema.
 * If the validation fails, it sends a response with a status code BAD_REQUEST.
 *
 * @param schema - The Joi schema used for validation.
 */
export const validateParameters: (schema: Joi.ObjectSchema) => RequestHandler = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params);
    if (error) {
      logger.debug(error, 'Validating request parameters failed');
      return res.status(StatusCodes.BAD_REQUEST).json(config.isProduction ? {} : { error: error.details[0].message });
    }
    next();
  };
};
