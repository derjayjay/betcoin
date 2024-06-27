import { uuid58 } from 'uuid-base58';

import { ProfileDto, UserGame, UserProfile, UserToken } from '../models/user.model';
import { Repository } from './repository';

class UserRepository extends Repository {
  public constructor(tableName?: string) {
    super(tableName, 'UserRepository');
  }

  public async createUser(user: ProfileDto): Promise<string | undefined> {
    const id = uuid58();
    const newUser: UserProfile = {
      pk: `user#${id}`,
      sk: 'profile',
      ...user,
    };

    const newUserGame: UserGame = {
      pk: `${newUser.pk}#game`,
      sk: 'game',
      score: 0,
      lastResult: 'new',
      currentBet: '',
    };

    // Add the new user profile and the game state to the database
    if (await this.putMany<UserProfile | UserGame>(newUser, newUserGame)) {
      return id;
    }
    this.logger.error(`Failed to create new user ${JSON.stringify(user)}`);
    return undefined;
  }

  // ...
  public async getUser(id: string): Promise<UserProfile | undefined> {
    return this.get(`user#${id}`, 'profile');
  }

  public async getUserGame(id: string): Promise<UserGame | undefined> {
    return this.get(`user#${id}#game`, 'game');
  }

  public async addUserToken(userId: string, newTokenId: string, newToken: string): Promise<boolean> {
    const newUserToken: UserToken = {
      pk: `user#${userId}`,
      sk: `token#${newTokenId}`,
      refreshToken: newToken,
    };

    return this.put<UserToken>(newUserToken);
  }

  public async getUserToken(userId: string, tokenId: string): Promise<UserToken | undefined> {
    return this.get(`user#${userId}`, `token#${tokenId}`);
  }

  public async deleteUserToken(userId: string, tokenId: string): Promise<boolean> {
    return this.delete(`user#${userId}`, `token#${tokenId}`);
  }
}

export default UserRepository;
