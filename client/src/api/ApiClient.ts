import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { StatusCodes } from 'http-status-codes';
import AuthClient from './AuthClient';
import { UserProfile } from './models';
import Log from '../util/logger';

interface RequestQueueItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: any;
  config: AxiosRequestConfig;
}

class ApiClient {
  private static instance: ApiClient;

  private api: AxiosInstance;
  private authService: AuthClient;

  private isRefreshingToken: boolean = false;
  private readonly requestQueue: RequestQueueItem[] = [];

  private constructor() {
    this.authService = AuthClient.getInstance();

    this.api = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL as string,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.api.interceptors.response.use((response) => response, this.tokenRefreshInterceptorHandler);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tokenRefreshInterceptorHandler = async (error: any) => {
    const originalRequest: AxiosRequestConfig = error.config;
    if (error.response && error.response.status === StatusCodes.UNAUTHORIZED) {
      if (!this.isRefreshingToken) {
        this.isRefreshingToken = true;
        try {
          // Refresh the access token
          if (await this.authService.refreshToken()) {
            // retry the failed requests during the refresh
            this.requestQueue.forEach((queueItem) => {
              this.api
                .request(queueItem.config)
                .then((response) => queueItem.resolve(response))
                .catch((err) => queueItem.reject(err));
            });

            // clear the queue
            this.requestQueue.length = 0;

            // return a retry for original request
            return this.api(originalRequest);
          }

          // we did not get a new access token, having to log out
          this.authService.logout();
        } catch (refreshError) {
          // something went wrong, need to log out
          this.authService.logout();
        } finally {
          this.isRefreshingToken = false;
        }
      }

      // original request failed due to expired token, queue it for a retry
      return new Promise<void>((resolve, reject) => {
        this.requestQueue.push({ config: originalRequest, resolve, reject });
      });
    }

    // original request did not fail due to expired token, let the sender handle it
    return Promise.reject(error);
  };

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Makes a GET request to the specified endpoint and returns a promise that resolves to the response data.
   * @param endpoint - The endpoint to send the GET request to.
   * @returns A promise that resolves to the response data.
   * @template T - The type of the response data.
   */
  public async getT<T>(endpoint: string): Promise<AxiosResponse<T>> {
    return this.api.get<T>(endpoint);
  }

  /**
   * Retrieves the user profile from the backend.
   * @returns A Promise that resolves to a UserProfile object if successful, or undefined if there was an error.
   */
  public async getUserProfile(): Promise<UserProfile | undefined> {
    return this.api
      .get<UserProfile>('/user/profile')
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        Log.error('Could not fetch user profile', error);
        return undefined;
      });
  }

  /**
   * Submits a bet with the specified direction.
   * @param direction - The direction of the bet ('up' or 'down').
   * @returns A Promise that resolves to the ID of the created bet, or undefined if the bet could not be created.
   */
  public async submitBet(direction: 'up' | 'down'): Promise<string | undefined> {
    return this.api
      .post('/bets/submit', { direction: direction })
      .then((response) => {
        return response.data.id;
      })
      .catch((error) => {
        Log.error('Could not create bet', error);
        return undefined;
      });
  }
}

export default ApiClient;
