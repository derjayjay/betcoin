import React, { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

export interface CountdownProps {
  startDate: Date;
  waitTime: number;
  onCountdownCompleted: () => void;
}

/**
 * Countdown component displays a countdown timer and a progress bar.
 *
 * @param startDate - The start date of the countdown.
 * @param waitTime - The duration of the countdown in seconds.
 * @param onCountdownCompleted - A callback function to be called when the countdown reaches zero.
 */
export const Countdown: React.FC<CountdownProps> = ({ startDate, waitTime, onCountdownCompleted }) => {
  const targetDate = new Date(startDate.getTime() + waitTime * 1000);
  const [countdown, setCountdown] = useState(differenceInSeconds(targetDate, new Date()));

  useEffect(() => {
    if (countdown <= 0) {
      onCountdownCompleted();
      return;
    }

    const intervalId = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countdown, onCountdownCompleted]);

  return (
    <>
      <div className="text-center text-4xl font-bold text-white">{countdown}</div>
      <div className="relative mb-5">
        <div className="mt-4 rounded-lg border border-white/15 bg-white/5">
          <div
            className="flex h-4 items-center justify-center rounded-lg bg-white"
            style={{ width: `${(countdown / waitTime) * 100}%` }}
          ></div>
        </div>
      </div>
    </>
  );
};
