import { differenceInSeconds } from 'date-fns';
import pino, { Logger } from 'pino';

import { BetDto } from '../models/bet.model';
import BetRepository from '../repositories/bet.repository';
import UserRepository from '../repositories/user.repository';
import config from '../utils/config';
import { PriceService } from './price.service';

export class BetService {
  private readonly betRepository: BetRepository;
  private readonly userRepository: UserRepository;
  private readonly priceService: PriceService;
  private readonly logger: Logger<never>;

  public constructor() {
    this.priceService = PriceService.getInstance();
    this.betRepository = new BetRepository();
    this.userRepository = new UserRepository();
    this.logger = pino({ name: `${config.SERVER_NAME} - PriceService`, level: config.LOG_LEVEL });
  }

  public async registerBet(userId: string, betDto: BetDto): Promise<string | undefined> {
    const btcPrice = this.priceService.getBtcPrice();
    const betId = await this.betRepository.createBet(userId, betDto, btcPrice.price);
    if (betId) {
      setTimeout(() => this.resolveBet(userId, betId), 60000);
      return betId;
    }

    return undefined;
  }

  public async hasOpenBet(userId: string): Promise<boolean | undefined> {
    // check if a user has an open bet
    const userGame = await this.userRepository.getUserGame(userId);
    if (userGame === undefined) {
      this.logger.error(`Failed to retrieve open bets for user ${userId}.`);
      return;
    }

    if (userGame.currentBet === '') {
      return false;
    }

    const bet = await this.betRepository.getBet(userId, userGame.currentBet);
    if (bet === undefined) {
      return false;
    }

    if (bet.state !== 'open') {
      return false;
    }

    const now = new Date();
    const creationDate = new Date(bet.submittedAt);
    if (differenceInSeconds(now, creationDate) >= 90) {
      // bet is overdue, we cannot resolve fairly
      await this.betRepository.expireBet(bet);
      return false;
    }

    return true;
  }

  public async resolveBet(userId: string, betId: string) {
    const bet = await this.betRepository.getBet(userId, betId);
    const userGame = await this.userRepository.getUserGame(userId);
    const btcPrice = this.priceService.getBtcPrice();

    if (bet === undefined || userGame === undefined) {
      this.logger.error({ bet: bet, userGame: userGame }, `Unable to resolve bet ${betId} for user ${userId}.`);
      return;
    }

    if (bet.state !== 'open') {
      return;
    }

    const now = new Date();
    const creationDate = new Date(bet.submittedAt);
    if (differenceInSeconds(now, creationDate) >= 90) {
      // bet is overdue, we cannot resolve fairly
      this.betRepository.updateBetAndGame(userId, betId, { state: 'expired' }, { lastResult: 'draw' });
      return;
    }

    if (
      (btcPrice.price > bet.priceAtCreation && bet.direction === 'up') ||
      (btcPrice.price < bet.priceAtCreation && bet.direction === 'down')
    ) {
      // resolve bet as won
      this.betRepository.updateBetAndGame(
        userId,
        betId,
        { state: 'won', priceAtResolution: btcPrice.price },
        { score: userGame.score + 1, lastResult: 'won' }
      );
    } else if (bet.priceAtCreation === btcPrice.price) {
      // bet is a draw, no change to score
      this.betRepository.updateBetAndGame(
        userId,
        betId,
        { state: 'draw', priceAtResolution: btcPrice.price },
        { lastResult: 'draw' }
      );
    } else {
      // resolve bet as lost
      this.betRepository.updateBetAndGame(
        userId,
        betId,
        { state: 'lost', priceAtResolution: btcPrice.price },
        {
          score: userGame.score
            ? userGame.score - 1 // user has still points to loose, take'em away
            : userGame.score, // user has no points to take
          lastResult: 'lost',
        }
      );
    }
  }
}
