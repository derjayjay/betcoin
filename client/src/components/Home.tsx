import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const handleButton = (path: string) => navigate(path);

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Hello, stranger!&nbsp; 👋
        <br />
        Wanna join the fun?
      </h1>
      <p className="mx-auto mt-6 text-lg leading-8 ">
        Come play this fun little game and see if you can correctly predict whether the BTC price will go up or down.
        There's no prize but the joy of bragging rights!
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <button
          onClick={() => handleButton('/register')}
          className="rounded-md bg-zinc-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
        >
          Register
        </button>
        <button onClick={() => handleButton('/login')} className="text-sm font-semibold leading-6 text-white">
          Login <span aria-hidden="true">→</span>
        </button>
      </div>
    </>
  );
};
