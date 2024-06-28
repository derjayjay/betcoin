import { uuid58 } from 'uuid-base58';

import { ProfileDto, UserGame, UserProfile, UserToken } from '../models/user.model';
import { Repository } from './repository';

/**
 * Repository class for managing user data in the database.
 */
/**
 * Repository class for managing user profiles and game states in the database.
 */
class UserRepository extends Repository {
  public constructor(tableName?: string) {
    super(tableName, 'UserRepository');
  }

  /*
   * Creates a new user profile and game state in the database.
   */
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

  /**
   * Retrieves a user profile by their ID.
   */
  public async getUser(id: string): Promise<UserProfile | undefined> {
    return this.get(`user#${id}`, 'profile');
  }

  /**
   * Retrieves a game state by the user's ID.
   */
  public async getUserGame(userId: string): Promise<UserGame | undefined> {
    return this.get(`user#${userId}#game`, 'game');
  }

  /**
   * Adds a refresh token for the user to the database.
   */
  public async addUserToken(userId: string, newTokenId: string, newToken: string): Promise<boolean> {
    const newUserToken: UserToken = {
      pk: `user#${userId}`,
      sk: `token#${newTokenId}`,
      refreshToken: newToken,
    };

    return this.put<UserToken>(newUserToken);
  }

  /**
   * Retrieves a refresh token by id for a specific user.
   */
  public async getUserToken(userId: string, tokenId: string): Promise<UserToken | undefined> {
    return this.get(`user#${userId}`, `token#${tokenId}`);
  }

  /**
   * Deletes a refresh token of a specific user.
   */
  public async deleteUserToken(userId: string, tokenId: string): Promise<boolean> {
    return this.delete(`user#${userId}`, `token#${tokenId}`);
  }
}

export default UserRepository;
