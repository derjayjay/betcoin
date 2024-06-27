import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Controller } from './controller';

class HealthController extends Controller {
  public constructor() {
    super('HealthController');
  }

  public isAlive = (_req: Request, resp: Response) => {
    resp.status(StatusCodes.OK).send('Alive');
  };
}

export default new HealthController();
