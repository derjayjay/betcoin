import { BaseEntity } from './base.model';

export interface ProfileDto {
  name: string;
}

export interface LoginDto {
  userId: string;
}

export interface UserProfile extends BaseEntity {
  name: string;
}

export interface UserGame extends BaseEntity {
  score: number;
  currentBet: string;
  lastResult: 'won' | 'lost' | 'draw' | 'new';
}

export interface UserToken extends BaseEntity {
  refreshToken: string;
}
