import axios from 'axios';
import { pino } from 'pino';

import config from '../utils/config';

type CoinDeskResponse = {
  time: {
    updatedISO: Date;
  };
  bpi: {
    USD: {
      code: string;
      rate_float: number;
    };
  };
};

export interface BtcPrice {
  price: number;
  updatedAt: Date;
}

/**
 * Service class for fetching and managing the current price of Bitcoin (BTC).
 */
export class PriceService {
  private static _instance: PriceService;
  private currentPrice: BtcPrice;

  private readonly logger = pino({ name: `${config.SERVER_NAME} - PriceService`, level: config.LOG_LEVEL });

  private constructor() {
    this.currentPrice = { price: 0, updatedAt: new Date() };
    this.fetchPrice();
  }

  /**
   * Retrieves the current price of Bitcoin (BTC).
   */
  public getBtcPrice(): BtcPrice {
    return this.currentPrice;
  }

  private async fetchPrice() {
    try {
      const coinDeskResponse = await axios.get<CoinDeskResponse>(config.COINDESK_API_URL, {
        timeout: config.COINDESK_API_TIMEOUT,
      });
      const price = Math.round((coinDeskResponse.data.bpi.USD.rate_float + Number.EPSILON) * 100) / 100;
      this.currentPrice = {
        price: price,
        updatedAt: coinDeskResponse.data.time.updatedISO,
      };
      this.logger.debug(`Updated BTC price to $${price.toFixed(2)}.`);
    } catch (error) {
      this.logger.error(error, `Failed to fetch updated price from CoinDesk.`);
    } finally {
      setTimeout(() => {
        this.fetchPrice();
      }, config.COINDESK_API_POLLING_RATE);
    }
  }

  /**
   * Retrieves the singleton instance of the PriceService class.
   */
  public static getInstance(): PriceService {
    return this._instance ?? (this._instance = new PriceService());
  }
}
