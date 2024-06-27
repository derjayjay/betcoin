// src/components/Logout.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthClient from '../api/AuthClient';

export const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AuthClient.getInstance().logout();
  }, [navigate]);

  return null; // No need to render anything
};
