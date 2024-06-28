import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { UserRequest } from '../middlewares/authentication.middleware';
import { BetDto } from '../models/bet.model';
import BetRepository from '../repositories/bet.repository';
import { BetService } from '../services/bet.service';
import { Controller } from './controller';
import { Amp } from 'aws-sdk';

class BetController extends Controller {
  private readonly betService: BetService;
  private readonly betRepository: BetRepository;

  public constructor() {
    super('BetController');
    this.betService = new BetService();
    this.betRepository = new BetRepository();
  }

  public submitBet = async (req: UserRequest, resp: Response) => {
    const userId = this.validateId(resp, req.user);
    if (!userId) return;

    if (!(await this.betService.hasOpenBet(userId))) {
      const bet = req.body as BetDto;
      const betId = await this.betService.registerBet(userId, bet);
      if (betId) {
        resp.status(StatusCodes.ACCEPTED).send({ betId: betId });
      } else {
        resp
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send(`Unexpected error submitting new bet for user with id ${userId}.`);
      }
    } else {
      resp.status(StatusCodes.NOT_ACCEPTABLE).send(`User ${userId} already has an open bet`);
    }
  };

  /**
   * Retrieves a specific bet for a user.
   *
   * @param req - The user request object.
   * @param resp - The response object.
   * @returns A Promise that resolves to the retrieved bet or an error message if the bet is not found.
   */
  public getBet = async (req: UserRequest, resp: Response) => {
    const userId = this.validateId(resp, req.user);
    if (!userId) return;

    const betId = req.params.id;
    const bet = await this.betService.getBet(userId, betId);
    if (bet) {
      resp.status(StatusCodes.OK).send({
        direction: bet.direction,
        state: bet.state,
        submittedAt: bet.submittedAt,
        priceAtCreation: bet.priceAtCreation,
        priceAtResolution: bet.priceAtResolution,
      });
    } else {
      resp.status(StatusCodes.NOT_FOUND).send(`Bet with id ${betId} not found for user with id ${userId}.`);
    }
  };
}

export default new BetController();
