import { NextFunction, Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { logger } from '../app';
import config from '../utils/config';

export interface UserRequest extends Request {
  user?: string;
}

/**
 * Middleware function to authenticate the JWT access token.
 */
export const authenticateToken: RequestHandler = (req: UserRequest, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken;

  jwt.verify(
    accessToken,
    config.JWT_ACCESS_TOKEN_SECRET,
    (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
      if (err) {
        // token is either expired or invalid
        logger.debug(err, 'Validating access token failed');
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
      }

      // token successfully verified, add user and continue with the request
      req.user = (decoded as jwt.JwtPayload).sub;
      next();
    }
  );
};
