import AuthClient from '../api/AuthClient';

export const useLoggedIn = () => {
  return AuthClient.isLoggedIn();
};
