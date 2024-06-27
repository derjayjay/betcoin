import React, { useState } from 'react';
import { Button, Field, Label, Input, Description } from '@headlessui/react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import AuthClient from '../api/AuthClient';

export const Login: React.FC = () => {
  const authService = AuthClient.getInstance();

  const [loginString, setLoginString] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const navigate = useNavigate();
  const handleReturn = () => navigate('/');

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(undefined);
    if (e.target.value && e.target.value !== '') {
      setLoginString(e.target.value);
    } else {
      setLoginString(undefined);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (loginString === undefined) return;
    authService.login(loginString).then((res: boolean) => {
      if (res) {
        navigate('/game');
      } else {
        setErrorMessage('Login string is wrong 😞');
      }
    });
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sign in</h1>
      <form className="w-full  mt-6 leading-8" onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="login" className="text-sm/6 font-medium text-white">
            Login by Magic String
          </Label>
          <Description className="text-sm/6 text-white/50"></Description>
          <Description className={`text-sm/6 ${errorMessage !== undefined ? 'text-red-500' : 'text-white/50'}`}>
            {errorMessage !== undefined ? (
              <>{errorMessage}</>
            ) : (
              <>Provide your login string from your profile page to sign in.</>
            )}
          </Description>
          <Input
            id="login"
            onChange={handleInput}
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
            disabled={loginString === undefined}
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
            Login
          </Button>
          <Button onClick={handleReturn} className="text-sm font-semibold leading-6 text-white">
            <span aria-hidden="true">←</span> return back
          </Button>
        </div>
      </form>
    </>
  );
};
