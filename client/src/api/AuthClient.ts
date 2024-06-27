import axios, { AxiosInstance } from 'axios';
import Log from '../util/logger';

class AuthClient {
  private static instance: AuthClient;

  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL as string,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient();
    }
    return AuthClient.instance;
  }

  async login(userId: string): Promise<boolean> {
    return await this.api
      .post<{ userId: string }>('/user/login', { userId: userId })
      .then((response) => {
        localStorage.setItem('userId', response.data.userId);
        return true;
      })
      .catch((error) => {
        Log.error('Failed to login user', error);
        return false;
      });
  }

  public async register(userName: string): Promise<boolean> {
    return await this.api
      .post<{ userId: string }>('/user/register', { name: userName })
      .then((response) => {
        localStorage.setItem('userId', response.data.userId);
        return true;
      })
      .catch((error) => {
        Log.error('Failed to register user', error);
        return false;
      });
  }

  public async refreshToken(): Promise<boolean> {
    return await this.api
      .get<{ userId: string }>('/user/auth/refresh')
      .then(() => {
        return true;
      })
      .catch((error) => {
        Log.error('Failed to refresh user', error);
        return false;
      });
  }

  public async logout(): Promise<boolean> {
    return await this.api
      .get<boolean>('/user/auth/logout')
      .then(() => {
        return true;
      })
      .catch((error) => {
        Log.error('Failed to logout user', error);
        return false;
      })
      .finally(() => {
        this.cleanupSession();
      });
  }

  private cleanupSession() {
    localStorage.removeItem('userId');
    window.location.reload();
  }

  public static isLoggedIn(): boolean {
    const userId = localStorage.getItem('userId');
    if (userId) {
      return true;
    }

    return false;
  }
}

export default AuthClient;
