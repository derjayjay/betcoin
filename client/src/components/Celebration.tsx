import React from 'react';

export interface CelebrationProps {
  betState: 'won' | 'lost' | 'draw' | 'open' | 'expired' | undefined;
  priceAtCreation: number | undefined;
  priceAtResolution: number | undefined;
}

export const Celebration: React.FC<CelebrationProps> = ({ betState, priceAtCreation, priceAtResolution }) => {
  const getCelebrationText = (state: 'won' | 'lost' | 'draw' | 'open' | 'expired' | undefined) => {
    switch (state) {
      case 'won':
        return 'You won! 🤩';
      case 'lost':
        return 'You lost... 😢';
      case 'draw':
        return "It's a draw. 😐";
      case 'expired':
        return 'Your bet expired. 😵';
      default:
        return 'Something weird happened. 😨';
    }
  };

  const getAdditionalText = (priceAtCreation: number | undefined, priceAtResolution: number | undefined) => {
    if (priceAtCreation === undefined || priceAtResolution === undefined) {
      return '';
    }

    const priceDifference = priceAtResolution - priceAtCreation;
    if (priceDifference === 0) {
      return `The BTC price remained unchanged at $${priceAtCreation.toFixed(2)}.`;
    } else {
      return `The BTC price started at $${priceAtCreation.toFixed(2)} and ${priceDifference > 0 ? 'rose' : 'fell'} to $${priceAtResolution.toFixed(2)}.`;
    }
  };

  return (
    <>
      <div className="text-center text-4xl font-bold text-white animate-pulse">{getCelebrationText(betState)}</div>
      <div className="tracking-tight mt-4 text-sm/6 font-medium text-white/50">
        {getAdditionalText(priceAtCreation, priceAtResolution)}
      </div>
    </>
  );
};
