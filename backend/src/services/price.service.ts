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

export class PriceService {
  private static _instance: PriceService;
  private currentPrice: BtcPrice;

  private readonly logger = pino({ name: `${config.SERVER_NAME} - PriceService`, level: config.LOG_LEVEL });

  private constructor() {
    this.currentPrice = { price: 0, updatedAt: new Date() };
    this.fetchPrice();
  }

  public getBtcPrice(): BtcPrice {
    return this.currentPrice;
  }

  private fetchPrice() {
    axios
      .get<CoinDeskResponse>(config.COINDESK_API_URL, { timeout: config.COINDESK_API_TIMEOUT })
      .then((response) => {
        const price = Math.round((response.data.bpi.USD.rate_float + Number.EPSILON) * 100) / 100;
        this.currentPrice = {
          price: price,
          updatedAt: response.data.time.updatedISO,
        };
      })
      .catch((error) => {
        this.logger.error(error, `Failed to fetch updated price from CoinDesk.`);
      })
      .finally(() => {
        setTimeout(() => {
          this.fetchPrice();
        }, config.COINDESK_API_POLLING_RATE);
      });
  }

  public static getInstance(): PriceService {
    return this._instance ?? (this._instance = new PriceService());
  }
}
