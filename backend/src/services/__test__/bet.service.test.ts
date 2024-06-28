import { vi } from 'vitest';

import { Bet, BetDto } from '../../models/bet.model';
import { UserGame } from '../../models/user.model';
import BetRepository from '../../repositories/bet.repository';
import UserRepository from '../../repositories/user.repository';
import { BetService } from '../bet.service';
import { PriceService } from '../price.service';

vi.mock('../repositories/bet.repository');
vi.mock('../repositories/user.repository');
vi.mock('../services/price.service');

describe('BetService', () => {
  const usersGames: Array<UserGame> = [
    { pk: 'user#U1', sk: 'game', score: 0, currentBet: 'B3', lastResult: 'lost' },
    { pk: 'user#U2', sk: 'game', score: 0, currentBet: 'B5', lastResult: 'won' },
    { pk: 'user#U3', sk: 'game', score: 0, currentBet: 'B6', lastResult: 'won' },
    { pk: 'user#U4', sk: 'game', score: 0, currentBet: '', lastResult: 'new' },
  ];

  const bets: Array<Bet> = [
    {
      pk: 'user#U1#bets',
      sk: 'bet#B3',
      state: 'open',
      priceAtCreation: 50000,
      priceAtResolution: undefined,
      submittedAt: new Date().getTime(),
      direction: 'up',
    },
    {
      pk: 'user#U2#bets',
      sk: 'bet#B5',
      state: 'won',
      priceAtCreation: 50000,
      priceAtResolution: undefined,
      submittedAt: new Date().getTime() - 60000,
      direction: 'down',
    },
    {
      pk: 'user#U3#bets',
      sk: 'bet#B6',
      state: 'open',
      priceAtCreation: 50000,
      priceAtResolution: undefined,
      submittedAt: new Date().getTime() - 120000,
      direction: 'down',
    },
  ];

  const betService: BetService = new BetService();

  describe('registerBet', () => {
    it('should return the betId if the bet is successfully registered', async () => {
      // Arrange
      const userId = 'U4';
      const betDto: BetDto = { direction: 'up' };
      const btcPrice = 50000;

      const getPrice = vi
        .spyOn(PriceService.prototype, 'getBtcPrice')
        .mockReturnValue({ price: btcPrice, updatedAt: new Date() });
      const createBet = vi.spyOn(BetRepository.prototype, 'createBet');

      let betId = '';

      const putMany = async (...args: any[]) => {
        betId = (args[0] as Bet).sk;
        return true;
      };

      const putAndUpdate = vi.spyOn((BetRepository as any).prototype, 'putAndUpdate').mockImplementation(putMany);

      // Act
      const result = await betService.registerBet(userId, betDto);

      // Assert
      expect(`bet#${result}`).toEqual(betId);
      expect(getPrice).toHaveBeenCalled();
      expect(putAndUpdate).toHaveBeenCalled();
      expect(createBet).toHaveBeenCalledWith(userId, betDto, btcPrice);
    });

    it('should return undefined if the bet registration fails', async () => {
      // Arrange
      const userId = 'U4';
      const betDto: BetDto = { direction: 'up' };
      const btcPrice = 50000;

      const getPrice = vi
        .spyOn(PriceService.prototype, 'getBtcPrice')
        .mockReturnValue({ price: btcPrice, updatedAt: new Date() });

      const createBet = vi.spyOn(BetRepository.prototype, 'createBet');
      const putAndUpdate = vi.spyOn((BetRepository as any).prototype, 'putAndUpdate').mockImplementation(async () => {
        return false;
      });

      // Act
      const result = await betService.registerBet(userId, betDto);

      // Assert
      expect(result).toBeUndefined();
      expect(getPrice).toHaveBeenCalled();
      expect(putAndUpdate).toHaveBeenCalled();
      expect(createBet).toHaveBeenCalledWith(userId, betDto, btcPrice);
    });
  });

  describe('hasOpenBet', () => {
    it("should return true if the user's current bet is open", async () => {
      // Arrange
      const userId = 'U1';
      const betId = 'B3';

      const getUserGame = vi
        .spyOn(UserRepository.prototype, 'getUserGame')
        .mockImplementation(async (userId: string) => {
          return usersGames.find((game) => game.pk === `user#${userId}`);
        });
      const getBet = vi
        .spyOn(BetRepository.prototype, 'getBet')
        .mockImplementation(async (userId: string, betId: string) => {
          return bets.find((bet) => bet.pk === `user#${userId}#bets` && bet.sk === `bet#${betId}`);
        });

      // Act
      const result = await betService.hasOpenBet(userId);

      // Assert
      expect(result).toBe(true);
      expect(getUserGame).toHaveBeenCalledWith(userId);
      expect(getBet).toHaveBeenCalledWith(userId, betId);
    });

    it("should return false if the user's current bet is resolved", async () => {
      // Arrange
      const userId = 'U2';
      const betId = 'B5';

      const getUserGame = vi
        .spyOn(UserRepository.prototype, 'getUserGame')
        .mockImplementation(async (userId: string) => {
          return usersGames.find((game) => game.pk === `user#${userId}`);
        });
      const getBet = vi
        .spyOn(BetRepository.prototype, 'getBet')
        .mockImplementation(async (userId: string, betId: string) => {
          return bets.find((bet) => bet.pk === `user#${userId}#bets` && bet.sk === `bet#${betId}`);
        });

      // Act
      const result = await betService.hasOpenBet(userId);

      // Assert
      expect(result).toBe(false);
      expect(getUserGame).toHaveBeenCalledWith(userId);
      expect(getBet).toHaveBeenCalledWith(userId, betId);
    });

    it("should return false and expire the bet if the user's current bet is overdue", async () => {
      // Arrange
      const userId = 'U3';
      const betId = 'B6';

      const getUserGame = vi
        .spyOn(UserRepository.prototype, 'getUserGame')
        .mockImplementation(async (userId: string) => {
          return usersGames.find((game) => game.pk === `user#${userId}`);
        });
      const getBet = vi
        .spyOn(BetRepository.prototype, 'getBet')
        .mockImplementation(async (userId: string, betId: string) => {
          return bets.find((bet) => bet.pk === `user#${userId}#bets` && bet.sk === `bet#${betId}`);
        });
      const expireBet = vi.spyOn(BetRepository.prototype, 'expireBet').mockImplementation(async (bet: Bet) => {
        return true;
      });

      // Act
      const result = await betService.hasOpenBet(userId);

      // Assert
      expect(result).toBe(false);
      expect(getUserGame).toHaveBeenCalledWith(userId);
      expect(getBet).toHaveBeenCalledWith(userId, betId);
      expect(expireBet).toHaveBeenCalledWith(bets[2]);
    });

    it('should return false if the user has not had a bet yet', async () => {
      // Arrange
      const userId = 'U4';

      const getUserGame = vi
        .spyOn(UserRepository.prototype, 'getUserGame')
        .mockImplementation(async (userId: string) => {
          return usersGames.find((game) => game.pk === `user#${userId}`);
        });

      // Act
      const result = await betService.hasOpenBet(userId);

      // Assert
      expect(result).toBe(false);
      expect(getUserGame).toHaveBeenCalledWith(userId);
    });

    it('should return false if an error occurs while retrieving the user game', async () => {
      // Arrange
      const userId = 'U5';
      const getUserGame = vi
        .spyOn(UserRepository.prototype, 'getUserGame')
        .mockImplementation(async (userId: string) => {
          return usersGames.find((game) => game.pk === `user#${userId}`);
        });

      // Act
      const result = await betService.hasOpenBet(userId);

      // Assert
      expect(result).toBeUndefined();
      expect(getUserGame).toHaveBeenCalledWith(userId);
    });
  });

  describe('getBet', () => {
    it('should return the bet if it exists', async () => {
      // Arrange
      const userId = 'U2';
      const betId = 'B5';
      const bet = bets[1]; // bet with id B5

      const getBet = vi
        .spyOn(BetRepository.prototype, 'getBet')
        .mockImplementation(async (userId: string, betId: string) => {
          return bets.find((bet) => bet.pk === `user#${userId}#bets` && bet.sk === `bet#${betId}`);
        });

      // Act
      const result = await betService.getBet(userId, betId);

      // Assert
      expect(result).toEqual(bet);
      expect(getBet).toHaveBeenCalledWith(userId, betId);
    });

    it('should return the bet but not expire it if the bet is not overdue', async () => {
      // Arrange
      const userId = 'U1';
      const betId = 'B3';
      const bet = bets[0]; // bet with id B3

      const getBet = vi
        .spyOn(BetRepository.prototype, 'getBet')
        .mockImplementation(async (userId: string, betId: string) => {
          return bets.find((bet) => bet.pk === `user#${userId}#bets` && bet.sk === `bet#${betId}`);
        });
      const expireBet = vi.spyOn(BetRepository.prototype, 'expireBet').mockImplementation(async (bet: Bet) => {
        return true;
      });

      // Act
      const result = await betService.getBet(userId, betId);

      // Assert
      expect(result).toEqual(bet);
      expect(getBet).toHaveBeenCalledWith(userId, betId);
      expect(expireBet).not.toHaveBeenCalled();
    });

    it("should return and expire the bet if the user's current bet is overdue", async () => {
      // Arrange
      const userId = 'U3';
      const betId = 'B6';
      const bet = bets[2]; // bet with id B6

      const getBet = vi
        .spyOn(BetRepository.prototype, 'getBet')
        .mockImplementation(async (userId: string, betId: string) => {
          return bets.find((bet) => bet.pk === `user#${userId}#bets` && bet.sk === `bet#${betId}`);
        });
      const expireBet = vi.spyOn(BetRepository.prototype, 'expireBet').mockImplementation(async (bet: Bet) => {
        return true;
      });

      // Act
      const result = await betService.getBet(userId, betId);

      // Assert
      expect(result).toEqual(bet);
      expect(getBet).toHaveBeenCalledWith(userId, betId);
      expect(expireBet).toHaveBeenCalledWith(bet);
    });

    it('should return undefined if the bet does not exist', async () => {
      // Arrange
      const userId = 'U1';
      const betId = 'B1';
      const getBet = vi
        .spyOn(BetRepository.prototype, 'getBet')
        .mockImplementation(async (userId: string, betId: string) => {
          return bets.find((bet) => bet.pk === `user#${userId}#bets` && bet.sk === `bet#${betId}`);
        });

      // Act
      const result = await betService.getBet(userId, betId);

      // Assert
      expect(result).toBeUndefined();
      expect(getBet).toHaveBeenCalledWith(userId, betId);
    });

    it('should return undefined if the was an error fetching the bet', async () => {
      // Arrange
      const userId = 'U1';
      const betId = 'B3';
      const getBet = vi
        .spyOn(BetRepository.prototype, 'getBet')
        .mockImplementation(async (userId: string, betId: string) => {
          return undefined;
        });

      // Act
      const result = await betService.getBet(userId, betId);

      // Assert
      expect(result).toBeUndefined();
      expect(getBet).toHaveBeenCalledWith(userId, betId);
    });
  });

  describe('resolveBet', () => {
    it('should resolve the bet as won if the condition is met', async () => {
      // Arrange
      const userId = 'U1';
      const betId = 'B1';
      const bet = { state: 'open', submittedAt: new Date().getTime() - 61000, priceAtCreation: 50000, direction: 'up' };
      const userGame = { score: 0 };
      const btcPrice = 60000;

      const getBet = vi.spyOn((BetRepository as any).prototype, 'getBet').mockResolvedValue(bet);
      const getUserGame = vi.spyOn((UserRepository as any).prototype, 'getUserGame').mockResolvedValue(userGame);
      const getBtcPrice = vi
        .spyOn((PriceService as any).prototype, 'getBtcPrice')
        .mockReturnValue({ price: btcPrice, updatedAt: new Date() });
      const updateBetAndGame = vi.spyOn((BetRepository as any).prototype, 'updateBetAndGame');

      // Act
      await betService.resolveBet(userId, betId);

      // Assert
      expect(getBet).toHaveBeenCalledWith(userId, betId);
      expect(getUserGame).toHaveBeenCalledWith(userId);
      expect(getBtcPrice).toHaveBeenCalled();
      expect(updateBetAndGame).toHaveBeenCalledWith(
        userId,
        betId,
        { state: 'won', priceAtResolution: btcPrice },
        { score: 1, lastResult: 'won' }
      );
    });

    it('should resolve the bet as lost if the condition is not met', async () => {
      // Arrange
      const userId = 'U1';
      const betId = 'B1';
      const bet = { state: 'open', submittedAt: new Date().getTime() - 61000, priceAtCreation: 50000, direction: 'up' };
      const userGame = { score: 1 };
      const btcPrice = 40000;

      const getBet = vi.spyOn((BetRepository as any).prototype, 'getBet').mockResolvedValue(bet);
      const getUserGame = vi.spyOn((UserRepository as any).prototype, 'getUserGame').mockResolvedValue(userGame);
      const getBtcPrice = vi
        .spyOn((PriceService as any).prototype, 'getBtcPrice')
        .mockReturnValue({ price: btcPrice, updatedAt: new Date() });
      const updateBetAndGame = vi.spyOn((BetRepository as any).prototype, 'updateBetAndGame');

      // Act
      await betService.resolveBet(userId, betId);

      // Assert
      expect(getBet).toHaveBeenCalledWith(userId, betId);
      expect(getUserGame).toHaveBeenCalledWith(userId);
      expect(getBtcPrice).toHaveBeenCalled();
      expect(updateBetAndGame).toHaveBeenCalledWith(
        userId,
        betId,
        { state: 'lost', priceAtResolution: btcPrice },
        { score: 0, lastResult: 'lost' }
      );
    });

    it('should resolve the bet as a draw if the condition is not met and the prices are equal', async () => {
      // Arrange
      const userId = 'user123';
      const betId = 'bet123';
      const bet = { state: 'open', submittedAt: new Date().getTime() - 61000, priceAtCreation: 50000, direction: 'up' };
      const userGame = { score: 1 };
      const btcPrice = 50000;

      const getBet = vi.spyOn((BetRepository as any).prototype, 'getBet').mockResolvedValue(bet);
      const getUserGame = vi.spyOn((UserRepository as any).prototype, 'getUserGame').mockResolvedValue(userGame);
      const getBtcPrice = vi
        .spyOn((PriceService as any).prototype, 'getBtcPrice')
        .mockReturnValue({ price: btcPrice, updatedAt: new Date() });
      const updateBetAndGame = vi.spyOn((BetRepository as any).prototype, 'updateBetAndGame');

      // Act
      await betService.resolveBet(userId, betId);

      // Assert
      expect(getBet).toHaveBeenCalledWith(userId, betId);
      expect(getUserGame).toHaveBeenCalledWith(userId);
      expect(getBtcPrice).toHaveBeenCalled();
      expect(updateBetAndGame).toHaveBeenCalledWith(
        userId,
        betId,
        { state: 'draw', priceAtResolution: btcPrice },
        { lastResult: 'draw' }
      );
    });

    it('should expire the net if the bet is overdue', async () => {
      // Arrange
      const userId = 'U1';
      const betId = 'B1';
      const bet = { state: 'open', submittedAt: new Date().getTime() - 91000, priceAtCreation: 50000, direction: 'up' };
      const userGame = { score: 1 };
      const btcPrice = 50000;
      const getBet = vi.spyOn((BetRepository as any).prototype, 'getBet').mockResolvedValue(bet);
      const getUserGame = vi.spyOn((UserRepository as any).prototype, 'getUserGame').mockResolvedValue(userGame);
      const getBtcPrice = vi
        .spyOn((PriceService as any).prototype, 'getBtcPrice')
        .mockReturnValue({ price: btcPrice, updatedAt: new Date() });
      const expireBet = vi.spyOn((BetRepository as any).prototype, 'expireBet');

      // Act
      await betService.resolveBet(userId, betId);

      // Assert
      expect(getBet).toHaveBeenCalledWith(userId, betId);
      expect(getUserGame).toHaveBeenCalledWith(userId);
      expect(getBtcPrice).toHaveBeenCalled();
      expect(expireBet).toHaveBeenCalledWith(bet);
    });
  });
});
