import { HttpException, HttpStatus } from '@nestjs/common';

export const throwNotFoundError = (message: string): void => {
  throw new HttpException(message, HttpStatus.NOT_FOUND);
};

export const throwInternalServerError = (message: string): void => {
  throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
};

export const throwUnathorizedError = (message: string): void => {
  throw new HttpException(message, HttpStatus.UNAUTHORIZED);
};

export const throwConflictError = (message: string): void => {
  throw new HttpException(message, HttpStatus.CONFLICT);
};

export const throwBadParametersError = (message: string): void => {
  throw new HttpException(message, HttpStatus.BAD_REQUEST);
};

export class ExpiredTokenException extends HttpException {
  constructor() {
    super('EXPIRED_TOKEN', HttpStatus.UNAUTHORIZED);
  }
}
