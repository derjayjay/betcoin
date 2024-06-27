import React, { useState } from 'react';
import { ScoreWidget } from './ScoreWidget';
import { PriceWidget } from './PriceWidget';
import { useGameState } from '../hooks/useGameState';
import { useUserProfile } from '../hooks/useUserProfile';
import ApiClient from '../api/ApiClient';
import { Bet } from '../api/models';
import { Countdown } from './Countdown';
import { BettingForm } from './BettingForm';
import { Celebration } from './Celebration';

export const Game: React.FC = () => {
  const { userProfile, isProfileLoading, isProfileError } = useUserProfile();
  const { gameState, isLoadingGame, isGameError, isBetError, updateGameState, updateBet } = useGameState();
  const [uiState, setUiState] = useState<'ready' | 'resolving' | 'showResult'>('ready');

  const resolveBet = () => {
    setUiState('resolving');
    updateBet().then((bet: Bet | undefined) => {
      if (bet === undefined) {
        return;
      } else if (bet === undefined || bet.state === 'open') {
        setTimeout(() => {
          resolveBet();
        }, 2500);
      } else {
        updateGameState();
        setUiState('showResult');
        setTimeout(() => {
          setUiState('ready');
        }, 5000);
      }
    });
  };

  const submitBet = (direction: 'up' | 'down') => {
    ApiClient.getInstance()
      .submitBet(direction)
      .then(() => updateGameState());
  };

  if (isProfileError) {
    return <div className="text-red-500 text-center text-xl font-semibold">Failed to load user profile.</div>;
  }

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Welcome, {isProfileLoading ? 'stranger' : userProfile?.name}!&nbsp; 👋
      </h1>
      <p>
        Your user id is {isProfileLoading ? 'unknown' : userProfile?.id}.<br />
        You can use this id to log in again later.
      </p>
      <div className="my-4 grid gap-8 sm:grid-cols-2">
        <PriceWidget />
        <ScoreWidget userScore={gameState.userGame} isLoading={isLoadingGame} isError={isGameError} />
      </div>
      <div className="mt-8 h-64 flex flex-col justify-center">
        {isGameError || isBetError ? (
          <div className="text-red-500 text-center text-xl font-semibold">Failed to load game state.</div>
        ) : uiState === 'resolving' ? (
          <div className="text-center text-4xl font-bold text-white animate-pulse">Resolving your bet...</div>
        ) : uiState === 'showResult' ? (
          <div className="text-center text-sm/6 font-medium text-white/50">
            <Celebration
              betState={gameState.currentBet?.state}
              priceAtCreation={gameState.currentBet?.priceAtCreation}
              priceAtResolution={gameState.currentBet?.priceAtResolution}
            />
          </div>
        ) : gameState.currentBet !== undefined && gameState.currentBet.state === 'open' ? (
          <Countdown
            onCountdownCompleted={resolveBet}
            startDate={new Date(gameState.currentBet.submittedAt)}
            waitTime={61}
          />
        ) : (
          <BettingForm onSubmit={submitBet} />
        )}
      </div>
    </>
  );
};
