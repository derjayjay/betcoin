import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useLoggedIn } from '../hooks/useLoggedIn';

export const PublicRoutes: React.FC = () => {
  const isLoggedIn = useLoggedIn();

  return isLoggedIn ? (
    <Navigate to="/game" />
  ) : (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
      <Outlet />
    </div>
  );
};
