import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExpiredTokenException } from '../../../shared/errors';

@Injectable()
export class AuthJwtGuard extends AuthGuard('jwt') {
  handleRequest(err: Error, user: any, info: Error): any {
    if (err || info || !user) {
      throw new ExpiredTokenException();
    }

    return user;
  }
}
