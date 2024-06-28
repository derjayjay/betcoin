import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { PriceService } from '../services/price.service';
import { Controller } from './controller';

class PriceController extends Controller {
  private readonly priceService: PriceService;

  public constructor() {
    super('PriceController');
    this.priceService = PriceService.getInstance();
  }

  /**
   * Retrieves the BTC price and sends it as a response.
   */
  public getBtcPrice = (_req: Request, resp: Response) => {
    const btcPrice = this.priceService.getBtcPrice();
    resp.status(StatusCodes.OK).send({
      price: btcPrice.price,
      updatedAt: btcPrice.updatedAt,
    });
  };
}

export default new PriceController();
