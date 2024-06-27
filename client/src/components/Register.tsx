import React, { useState } from 'react';
import { Button, Field, Label, Input, Description } from '@headlessui/react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import AuthClient from '../api/AuthClient';

export const Register: React.FC = () => {
  const authService = AuthClient.getInstance();

  const [userName, setUserName] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isInvalid, setIsInvalid] = useState<boolean>(false);

  const navigate = useNavigate();
  const handleReturn = () => navigate('/');
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(undefined);
    setIsInvalid(false);
    if (e.target.value && e.target.value !== '') {
      setUserName(e.target.value);
    } else {
      setUserName(undefined);
    }
  };
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (
      userName === undefined ||
      userName.length < 3 ||
      userName.length > 63 ||
      !/^[a-zA-Z0-9][a-zA-Z0-9 _-]*[a-zA-Z0-9]$/.test(userName)
    ) {
      setIsInvalid(true);
      return;
    }
    authService.register(userName).then((res: boolean) => {
      if (res) {
        navigate('/game');
      } else {
        setErrorMessage('Registration failed 😞');
        setIsInvalid(true);
      }
    });
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Register</h1>
      <form className="w-full  mt-6 leading-8" onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="username" className="text-sm/6 font-medium text-white">
            Your name
          </Label>
          <Description className={`text-sm/6 ${isInvalid ? 'text-red-500' : 'text-white/50'}`}>
            {errorMessage || (
              <>
                Please provide your name so we know how to call you. Your name must be 3 - 63 characters long, start and
                end with a letter or number and may only contain ' ', '-', '.' and '_'.
              </>
            )}
          </Description>
          <Input
            id="username"
            onChange={handleInput}
            invalid={isInvalid}
            className={clsx(
              'mt-3 relative block w-full appearance-none rounded-lg bg-white/5 py-1.5 px-3 text-sm/6 text-white',
              'border border-white/10 data-[hover]:border-white/20',
              'data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500',
              'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
            )}
          />
        </Field>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            type="submit"
            disabled={userName === undefined}
            className={clsx(
              'rounded-md px-3.5 py-2.5 shadow-sm text-white text-sm font-semibold',
              'bg-zinc-600, hover:bg-zinc-500',
              'bg-zinc-600 shadow-sm',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600',
              'disabled:bg-zinc-500 disabled:cursor-not-allowed disabled:shadow-none disabled:text-white/50',
              'disabled:hover:bg-zinc-500 disabled:hover:shadow-none disabled:hover:text-white/50'
            )}
          >
            Register
          </Button>
          <Button onClick={handleReturn} className="text-sm font-semibold leading-6 text-white">
            <span aria-hidden="true">←</span> return back
          </Button>
        </div>
      </form>
    </>
  );
};
