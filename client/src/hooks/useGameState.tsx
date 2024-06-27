import useSWR, { Fetcher } from 'swr';
import { fetcher } from '../util/fetcher';
import { UserGame, Bet } from '../api/models';

const gameFetcher: Fetcher<UserGame, string> = async (key: string) => fetcher<UserGame>(key);
const betFetcher: Fetcher<Bet, string> = async (key: string) => fetcher<Bet>(key);

/*
 * Hook for fetching the user's game state and current bet from the backend.
 */
export const useGameState = () => {
  const {
    data: userGame,
    error: gameError,
    isLoading: isLoadingGame,
    mutate: updateGameState,
  } = useSWR('user/game', gameFetcher);
  const {
    data: currentBet,
    error: betError,
    isLoading: isLoadingBet,
    mutate: updateBet,
  } = useSWR(
    () => (userGame?.currentBet !== undefined && userGame.currentBet !== '' ? `bets/${userGame.currentBet}` : false),
    betFetcher
  );

  return {
    gameState: {
      userGame: userGame,
      currentBet: currentBet,
    },
    isLoadingGame: isLoadingGame,
    isLoadingBet: isLoadingBet,
    isGameError: gameError,
    isBetError: betError,
    updateGameState: updateGameState,
    updateBet: updateBet,
  };
};
