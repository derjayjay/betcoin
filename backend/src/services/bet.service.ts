import { differenceInSeconds } from 'date-fns';
import pino, { Logger } from 'pino';

import { Bet, BetDto } from '../models/bet.model';
import BetRepository from '../repositories/bet.repository';
import UserRepository from '../repositories/user.repository';
import config from '../utils/config';
import { PriceService } from './price.service';

/**
 * Service responsible for managing and resolving bets.
 */
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

  /**
   * Registers a new bet for a user.
   *
   * @param userId - The ID of the user placing the bet.
   * @param betDto - The data for the bet.
   * @returns A promise that resolves to the ID of the created bet, or undefined if the bet could not be created.
   */
  public async registerBet(userId: string, betDto: BetDto): Promise<string | undefined> {
    const btcPrice = this.priceService.getBtcPrice();
    const betId = await this.betRepository.createBet(userId, betDto, btcPrice.price);
    if (betId) {
      setTimeout(() => this.resolveBet(userId, betId), 60000);
      return betId;
    }

    return undefined;
  }

  /**
   * Checks if the latest bet of the user is still open.
   * If the user has an overdue bet, it expires it.
   *
   * @param userId - The ID of the user.
   * @returns A Promise that resolves to a boolean indicating whether the user has an open bet.
   */
  public async hasOpenBet(userId: string): Promise<boolean | undefined> {
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

    if (this.isBetOverdue(bet)) {
      // bet is overdue
      await this.betRepository.expireBet(bet);
      return false;
    }

    return true;
  }

  /**
   * Retrieves a bet for a specific user.
   * If the bet is overdue, it will be expired.
   *
   * @param userId - The ID of the user.
   * @param betId - The ID of the bet.
   * @returns A Promise that resolves to the retrieved bet, or undefined if the bet does not exist.
   */
  public async getBet(userId: string, betId: string): Promise<Bet | undefined> {
    const bet = await this.betRepository.getBet(userId, betId);
    if (bet === undefined) {
      return undefined;
    }

    if (this.isBetOverdue(bet)) {
      // bet is overdue
      await this.betRepository.expireBet(bet);
    }

    return bet;
  }

  /**
   * Resolves a bet for a given user.
   *
   * @param userId - The ID of the user.
   * @param betId - The ID of the bet.
   * @returns void
   */
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

    if (this.isBetOverdue(bet)) {
      // bet is overdue, we cannot resolve fairly
      await this.betRepository.expireBet(bet);
      return;
    }

    if (
      (btcPrice.price > bet.priceAtCreation && bet.direction === 'up') ||
      (btcPrice.price < bet.priceAtCreation && bet.direction === 'down')
    ) {
      // resolve bet as won
      await this.betRepository.updateBetAndGame(
        userId,
        betId,
        { state: 'won', priceAtResolution: btcPrice.price },
        { score: userGame.score + 1, lastResult: 'won' }
      );
    } else if (bet.priceAtCreation === btcPrice.price) {
      // bet is a draw, no change to score
      await this.betRepository.updateBetAndGame(
        userId,
        betId,
        { state: 'draw', priceAtResolution: btcPrice.price },
        { lastResult: 'draw' }
      );
    } else {
      // resolve bet as lost
      await this.betRepository.updateBetAndGame(
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

  /**
   * Checks if a bet is overdue.
   * A bet is considered overdue if it is open and has been submitted more than 90 seconds ago.
   *
   * @param bet - The bet to check.
   * @returns `true` if the bet is overdue, `false` otherwise.
   */
  private isBetOverdue(bet: Bet): boolean {
    const now = new Date();
    const submissionDate = new Date(bet.submittedAt);

    // a bet is overdue if it is open and has been submitted more than 90 seconds ago
    return bet.state === 'open' && differenceInSeconds(now, submissionDate) >= 90;
  }
}
