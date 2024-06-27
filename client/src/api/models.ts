export interface UserProfile {
  id: string;
  name: string;
  lastBet: string;
}

export interface UserGame {
  score: number;
  lastResult: 'won' | 'lost' | 'draw' | 'new';
  currentBet: string;
}

export interface Bet {
  direction: 'up' | 'down';
  state: 'open' | 'expired' | 'won' | 'lost' | 'draw';
  submittedAt: number;
  priceAtCreation: number | undefined;
  priceAtResolution: number | undefined;
}
