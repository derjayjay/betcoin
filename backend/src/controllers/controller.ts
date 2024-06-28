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

  /**
   * Validates the provided ID and sets the response to FORBIDDEN if the ID is invalid.
   * If this function returns undefined, the ID is invalid and the controller function should return immediately.
   *
   * @param resp - The response object used to send the HTTP response.
   * @param id - The ID to validate.
   * @returns The validated ID if it is valid, otherwise undefined.
   */
  protected validateId(resp: Response, id?: string): string | undefined {
    if (id !== undefined && valid(id)) {
      return id;
    } else {
      resp.sendStatus(StatusCodes.FORBIDDEN);
      return;
    }
  }
}
