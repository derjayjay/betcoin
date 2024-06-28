import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { uuid58 } from 'uuid-base58';

import { UserRequest } from '../middlewares/authentication.middleware';
import { LoginDto, ProfileDto } from '../models/user.model';
import UserRepository from '../repositories/user.repository';
import config from '../utils/config';
import { Controller } from './controller';

class UserController extends Controller {
  private readonly userRepository: UserRepository;

  public constructor() {
    super('UserController');
    this.userRepository = new UserRepository();
  }

  /**
   * Registers a new user and sends a response with the user ID.
   * If the user is created successfully, it prepares JWT cookies and sends a response with status 200.
   */
  public registerUser = async (req: Request, resp: Response) => {
    const user = req.body as ProfileDto;
    const userId = await this.userRepository.createUser(user);

    this.logger.debug(`Created new user with id ${userId}`);
    if (userId) {
      await this.prepareJwtCookies(userId, resp);
      resp.status(StatusCodes.OK).send({ userId: userId });
    } else {
      resp.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Failed to create new user ${JSON.stringify(user)}`);
    }
  };

  /**
   * Logs in a user and sends a response with the user ID.
   * If the user is found, it prepares JWT cookies and sends a response with status 200.
   * If the user is not found, it sends a response with status 404 and an error message.
   */
  public loginUser = async (req: Request, resp: Response) => {
    const userId = (req.body as LoginDto).userId;
    const user = await this.userRepository.getUser(userId);

    if (user) {
      await this.prepareJwtCookies(userId, resp);
      resp.status(StatusCodes.OK).send({ userId: userId });
    } else {
      resp.status(StatusCodes.NOT_FOUND).send(`Profile for user with id ${userId} not found`);
    }
  };

  /**
   * Logs out a user by deleting the user token associated with the refresh token.
   * If the refresh token is valid, both tokens are renewed.
   * If the refresh token is invalid or there was an error deleting the stored token, a forbidden status is sent.
   */
  public logoutUser = async (req: UserRequest, resp: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      resp.sendStatus(StatusCodes.FORBIDDEN);
      return;
    }

    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_TOKEN_SECRET) as jwt.JwtPayload;
      const userId = this.validateId(resp, decoded.sub);
      const refreshTokenId = this.validateId(resp, decoded.jti);
      if (!userId || !refreshTokenId) return;

      const userToken = await this.userRepository.getUserToken(userId, refreshTokenId);
      if (
        userToken &&
        userToken.refreshToken === refreshToken &&
        (await this.userRepository.deleteUserToken(userId, refreshTokenId))
      ) {
        // refresh token is valid, renew both tokens
        resp.sendStatus(StatusCodes.OK);
      } else {
        // provided refresh token does not match the stored one or there was an error deleting the stored token
        resp.sendStatus(StatusCodes.FORBIDDEN);
      }
    } catch (err) {
      this.logger.error(err, 'Failed to validate refreshToken.');
      return resp.sendStatus(StatusCodes.FORBIDDEN);
    }
  };

  /**
   * Refreshes the access token using the provided refresh token.
   * If the refresh token is valid, both the access token and the refresh token are renewed.
   * If the refresh token is invalid or there was an error, a forbidden status is sent.
   */
  public refreshToken = async (req: Request, resp: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      resp.sendStatus(StatusCodes.FORBIDDEN);
      return;
    }

    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_TOKEN_SECRET) as jwt.JwtPayload;
      const userId = this.validateId(resp, decoded.sub);
      const refreshTokenId = this.validateId(resp, decoded.jti);
      if (!userId || !refreshTokenId) return;

      const userToken = await this.userRepository.getUserToken(userId, refreshTokenId);
      if (
        userToken &&
        userToken.refreshToken === refreshToken &&
        (await this.userRepository.deleteUserToken(userId, refreshTokenId))
      ) {
        // refresh token is valid, renew both tokens
        await this.prepareJwtCookies(userId, resp);
        resp.sendStatus(StatusCodes.OK);
      } else {
        // provided refresh token does not match the stored one or there was an error deleting the stored token
        resp.sendStatus(StatusCodes.FORBIDDEN);
      }
    } catch (err) {
      this.logger.error(err, 'Failed to validate refreshToken.');
      return resp.sendStatus(StatusCodes.FORBIDDEN);
    }
  };

  /**
   * Retrieves the user profile based on the user ID provided in the access token.
   */
  public getUserProfile = async (req: UserRequest, resp: Response) => {
    const userId = this.validateId(resp, req.user);
    if (!userId) return;

    const user = await this.userRepository.getUser(userId);
    if (user) {
      resp.status(StatusCodes.OK).send({ id: userId, name: user.name });
    } else {
      resp.status(404).send(`Profile for user with id ${userId} not found`);
    }
  };

  /**
   * Retrieves the game information for a specific user profile based on the user ID provided in the access token..
   */
  public getUserGame = async (req: UserRequest, resp: Response) => {
    const userId = this.validateId(resp, req.user);
    if (!userId) return;

    const game = await this.userRepository.getUserGame(userId);
    if (game) {
      resp.status(StatusCodes.OK).send({ score: game.score, lastResult: game.lastResult, currentBet: game.currentBet });
    } else {
      resp.status(404).send(`Game for user with id ${userId} not found`);
    }
  };

  /**
   * Prepares and sets JWT cookies for the specified user.
   * @param userId - The ID of the user.
   * @param resp - The response object to set the cookies on.
   * @returns A promise that resolves when the cookies are set.
   */
  private async prepareJwtCookies(userId: string, resp: Response): Promise<void> {
    const refreshTokenId = uuid58();
    const accessToken = jwt.sign({ sub: userId }, config.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: ms(config.JWT_ACCESS_TOKEN_EXPIRATION),
    });
    const refreshToken = jwt.sign({ sub: userId, jti: refreshTokenId }, config.JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: ms(config.JWT_REFRESH_TOKEN_EXPIRATION),
    });

    if (await this.userRepository.addUserToken(userId, refreshTokenId, refreshToken)) {
      resp.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.isProd ? true : false,
        sameSite: config.isProd ? 'strict' : 'lax',
        maxAge: ms(config.JWT_ACCESS_TOKEN_EXPIRATION),
      });
      resp.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.isProd ? true : false,
        sameSite: config.isProd ? 'strict' : 'lax',
        path: '/user/auth',
        maxAge: ms(config.JWT_REFRESH_TOKEN_EXPIRATION),
      });
    }
  }
}

export default new UserController();
