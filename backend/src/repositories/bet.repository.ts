import { uuid58 } from 'uuid-base58';

import { Bet, BetDto } from '../models/bet.model';
import { UserGame } from '../models/user.model';
import { Repository } from './repository';

class BetRepository extends Repository {
  public constructor(tableName?: string) {
    super(tableName, 'BetRepository');
  }

  public async createBet(userId: string, bet: BetDto, btcPrice: number): Promise<string | undefined> {
    const id = uuid58();
    const now = new Date();
    const newBet: Bet = {
      pk: `user#${userId}#bets`,
      sk: `bet#${id}`,
      state: 'open',
      priceAtCreation: btcPrice,
      priceAtResolution: undefined,
      submittedAt: now.getTime(),
      ...bet,
    };

    // Add the new user and the score to the database
    if (
      await this.putAndUpdate<Bet, UserGame>(newBet, {
        pk: `user#${userId}#game`,
        sk: 'game',
        records: { currentBet: id },
      })
    ) {
      return id;
    }
    this.logger.error(`Failed to create new bet ${bet.direction} for user ${userId}`);
    return undefined;
  }

  public async getBet(userId: string, betId: string): Promise<Bet | undefined> {
    return this.get(`user#${userId}#bets`, `bet#${betId}`);
  }

  public async updateBet(userId: string, betId: string, bet: Partial<Bet>): Promise<boolean> {
    return this.update(`user#${userId}#bets`, `bet#${betId}`, bet);
  }

  public async updateBetAndGame(
    userId: string,
    betId: string,
    bet: Partial<Bet>,
    game: Partial<UserGame>
  ): Promise<boolean> {
    return this.updateMany<Bet | UserGame>(
      { pk: `user#${userId}#bets`, sk: `bet#${betId}`, records: bet },
      { pk: `user#${userId}#game`, sk: 'game', records: game }
    );
  }

  public async expireBet(bet: Bet): Promise<boolean> {
    return this.update<Bet>(bet.pk, bet.sk, { state: 'expired' });
  }
}

export default BetRepository;
