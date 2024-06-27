import React, { useState } from 'react';
import { Button, Field, Label, Description } from '@headlessui/react';
import { clsx } from 'clsx';
import { Toggle } from './Toggle';

export interface BettingFormProps {
  onSubmit: (direction: 'up' | 'down') => void;
}

export const BettingForm: React.FC<BettingFormProps> = ({ onSubmit }) => {
  const [nextBet, setNextBet] = useState<'up' | 'down' | undefined>();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (nextBet !== undefined) onSubmit(nextBet);
  };

  return (
    <div className="">
      <h2 className="text-1xl font-bold tracking-tight sm:text-2xl">Play the next round</h2>
      <form className="w-full  mt-6 leading-8" onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="login" className="text-sm/6 font-medium text-white">
            Your next bet
          </Label>
          <Description className="text-sm/6 text-white/50">In the next 60 seconds, the BTC price will go:</Description>
          <Toggle onChangeState={(value) => setNextBet(value)} />
        </Field>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            disabled={nextBet === undefined}
            type="submit"
            className={clsx(
              'rounded-md px-3.5 py-2.5 shadow-sm text-white text-sm font-semibold',
              'bg-zinc-600, hover:bg-zinc-500',
              'bg-zinc-600 shadow-sm',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600',
              'disabled:bg-zinc-500 disabled:cursor-not-allowed disabled:shadow-none disabled:text-white/50',
              'disabled:hover:bg-zinc-500 disabled:hover:shadow-none disabled:hover:text-white/50'
            )}
          >
            Submit your bet
          </Button>
        </div>
      </form>
    </div>
  );
};
