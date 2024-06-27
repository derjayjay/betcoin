import { BaseEntity } from './base.model';

export interface BetDto {
  direction: 'up' | 'down';
}

export interface Bet extends BaseEntity, BetDto {
  state: 'open' | 'expired' | 'won' | 'lost' | 'draw';
  submittedAt: number;
  priceAtCreation: number;
  priceAtResolution: number | undefined;
}
