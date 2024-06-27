import useSWR from 'swr';

import { fetcher } from '../util/fetcher';
import { UserProfile } from '../api/models';

/*
 * Hook for fetching the user's profile from the backend.
 */
export const useUserProfile = () => {
  const { data, error, isLoading } = useSWR('user/profile', fetcher<UserProfile>, {
    revalidateOnFocus: false,
  });

  return {
    userProfile: data,
    isProfileLoading: isLoading,
    isProfileError: error,
  };
};
