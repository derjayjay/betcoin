import useSWR from 'swr';
import { fetcher } from '../util/fetcher';

/*
 * Hook for polling the current BTC price from the server
 */
export const useBtcPrice = () => {
  const { data, error, isLoading } = useSWR('price/btc', fetcher<{ price: number; updatedAt: Date }>, {
    refreshInterval: 30000,
    revalidateOnFocus: false,
  });

  return {
    btcPrice: data,
    isLoading: isLoading,
    isError: error,
  };
};
