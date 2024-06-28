import axios from 'axios';
import { Mock, vi } from 'vitest';

import config from '../../utils/config';
import { BtcPrice, PriceService } from '../price.service';

vi.mock('axios');
vi.useFakeTimers();

describe('PriceService', () => {
  let priceService: PriceService;

  beforeEach(() => {
    priceService = PriceService.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch the BTC price from CoinDesk API', async () => {
    // Arrange
    const mockResponse = {
      time: {
        updated: 'Jun 26, 2024 08:35:30 UTC',
        updatedISO: '2024-06-26T08:35:30+00:00',
        updateduk: 'Jun 26, 2024 at 09:35 BST',
      },
      disclaimer:
        'This data was produced from the CoinDesk Bitcoin Price Index (USD). Non-USD currency data converted using hourly conversion rate from openexchangerates.org',
      chartName: 'Bitcoin',
      bpi: {
        USD: {
          code: 'USD',
          symbol: '&#36;',
          rate: '61,375.968',
          description: 'United States Dollar',
          rate_float: 61375.968,
        },
        GBP: {
          code: 'GBP',
          symbol: '&pound;',
          rate: '48,543.112',
          description: 'British Pound Sterling',
          rate_float: 48543.1124,
        },
        EUR: { code: 'EUR', symbol: '&euro;', rate: '57,376.649', description: 'Euro', rate_float: 57376.6486 },
      },
    };

    // Act
    const axios_get = (axios.get as Mock).mockResolvedValue({ data: mockResponse });

    await vi.advanceTimersByTimeAsync(config.COINDESK_API_POLLING_RATE);
    const { price, updatedAt }: BtcPrice = priceService.getBtcPrice();

    // Assert
    expect(axios_get).toHaveBeenCalledWith(config.COINDESK_API_URL, { timeout: config.COINDESK_API_TIMEOUT });
    expect(price).toBe(61375.97);
    expect({ price: price, updatedAt: new Date(updatedAt).getTime() }).toEqual({
      price: 61375.97,
      updatedAt: new Date('2024-06-26T08:35:30Z').getTime(),
    });
  });

  it('should handle errors gracefully when fetching the BTC price from CoinDesk API', async () => {
    // Arrange
    const mockResponse = {
      time: {
        updatedISO: new Date('2024-06-26T08:35:25Z'),
      },
      bpi: {
        USD: {
          code: 'USD',
          rate_float: 60000,
        },
      },
    };

    // Act
    const axios_get = (axios.get as Mock)
      .mockResolvedValueOnce({ data: mockResponse })
      .mockRejectedValue(new Error('Failed to fetch price'));

    await vi.advanceTimersByTimeAsync(config.COINDESK_API_POLLING_RATE);
    await vi.advanceTimersByTimeAsync(config.COINDESK_API_POLLING_RATE);
    await vi.advanceTimersByTimeAsync(config.COINDESK_API_POLLING_RATE);
    const btcPrice: BtcPrice = priceService.getBtcPrice();

    // Assert
    expect(axios_get).toHaveBeenCalledTimes(3);
    expect(axios.get).toHaveBeenCalledWith(config.COINDESK_API_URL, { timeout: config.COINDESK_API_TIMEOUT });
    expect(btcPrice).toEqual({ price: 60000, updatedAt: new Date('2024-06-26T08:35:25Z') });
  });

  it('should periodically fetch the BTC price from CoinDesk API', async () => {
    // Arrange
    const mockResponse = {
      time: {
        updatedISO: new Date('2024-06-26T08:35:25Z'),
      },
      bpi: {
        USD: {
          code: 'USD',
          rate_float: 60000,
        },
      },
    };

    // Act
    const axios_get = (axios.get as Mock).mockResolvedValue({ data: mockResponse });

    await vi.advanceTimersByTimeAsync(config.COINDESK_API_POLLING_RATE);
    let btcPrice: BtcPrice = priceService.getBtcPrice();

    // Assert
    expect(axios_get).toHaveBeenCalledOnce();
    expect(axios_get).toHaveBeenCalledWith(config.COINDESK_API_URL, { timeout: config.COINDESK_API_TIMEOUT });
    expect(btcPrice).toEqual({ price: 60000, updatedAt: new Date('2024-06-26T08:35:25Z') });

    // Act
    mockResponse.bpi.USD.rate_float = 50000;
    mockResponse.time.updatedISO = new Date('2024-06-26T08:35:55Z');

    await vi.advanceTimersByTimeAsync(config.COINDESK_API_POLLING_RATE);
    btcPrice = priceService.getBtcPrice();

    // Assert
    expect(axios_get).toHaveBeenCalledTimes(2);
    expect(btcPrice).toEqual({ price: 50000, updatedAt: new Date('2024-06-26T08:35:55Z') });
  });
});
