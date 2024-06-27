import ApiClient from '../api/ApiClient';
import logger from './logger';

export const fetcher = async function <T>(url: string) {
  const api = ApiClient.getInstance();
  return api
    .getT<T>(url)
    .then((result) => {
      if (result.data === undefined) {
        throw new Error();
      }
      return result.data;
    })
    .catch((error) => {
      logger.error('Failed to fetch game state from server.', error);
      throw new Error();
    });
};
