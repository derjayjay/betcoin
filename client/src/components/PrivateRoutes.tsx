import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useLoggedIn } from '../hooks/useLoggedIn';

export const PrivateRoutes: React.FC = () => {
  const isLoggedIn = useLoggedIn();

  return isLoggedIn ? (
    <>
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
        <Outlet />
      </div>
      <div className="text-center text-sm underline decoration-dotted text-zinc-500">
        <a href="/logout">Click here to log out</a>
      </div>
    </>
  ) : (
    <Navigate to="/" />
  );
};
