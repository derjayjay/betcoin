import { Widget } from './Widget';
import { UserGame } from '../api/models';

function betStateToText(betStat: 'won' | 'lost' | 'draw' | 'new' | undefined): string {
  switch (betStat) {
    case 'won':
      return 'You won your last bet. 🤩';
    case 'lost':
      return 'You lost your last bet. 😢';
    case 'draw':
      return 'Your last bet was a draw. 😐';
    case 'new':
      return 'You have no bets yet. 🤔';
    default:
      return 'Unknown bet status. 🤷‍♂️';
  }
}

export interface ScoreWidgetProps {
  userScore: UserGame | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Renders a widget displaying the user's score.
 */
export const ScoreWidget: React.FC<ScoreWidgetProps> = ({ userScore, isLoading, isError }) => {
  const title = 'Your Score';
  let content = '';
  let status = '';

  if (isLoading) {
    content = '???';
    status = 'Fetching user profile...';
  } else if (isError) {
    content = '😵';
    status = 'Failed to fetch user profile';
  } else {
    content = `${userScore?.score} points`;
    status = betStateToText(userScore?.lastResult);
  }

  return <Widget title={title} content={content} status={status} />;
};
