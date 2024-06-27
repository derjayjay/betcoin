import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import pino, { Logger } from 'pino';
import { valid } from 'uuid-base58';

import config from '../utils/config';

export class Controller {
  protected readonly logger: Logger<never>;

  protected constructor(name: string) {
    this.logger = pino({ name: `${config.SERVER_NAME} - ${name}`, level: config.LOG_LEVEL });
  }

  protected validateId(resp: Response, id?: string): string | undefined {
    if (id !== undefined && valid(id)) {
      return id;
    } else {
      resp.sendStatus(StatusCodes.FORBIDDEN);
      return;
    }
  }
}
