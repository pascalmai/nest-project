/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { classToPlain } from 'class-transformer';
import { Request } from 'express';
import omit from 'lodash/omit';
import { Observable, of } from 'rxjs';
import { LoginResponseDto } from '../auth/auth.dto';
import { ResponseUserDto } from '../user/user.dto';

@Injectable()
export class JwtCookieService {
  constructor(private readonly jwtService: JwtService) {}

  verifyToken(token: string, options?: JwtVerifyOptions): any {
    return this.jwtService.verify(token, options);
  }

  decodeToken(token: string, options?: any): any {
    return this.jwtService.decode(token, options);
  }

  sign(
    payload: string | Buffer | Record<string, unknown>,
    options?: JwtSignOptions,
  ): string {
    return this.jwtService.sign(payload, options);
  }

  generateAccessToken(user: ResponseUserDto): string {
    return this.generateJwtToken(user);
  }

  refreshToken(
    req: Request,
    user: ResponseUserDto,
  ): Observable<LoginResponseDto> {
    const accessToken = this.generateAccessToken(user);
    this.setJwtCookies(req, accessToken);

    return of({ accessToken });
  }

  setJwtCookies(req: Request, accessToken: string): void {
    const accessTokenCookie = `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${process.env.JWT_ACCESS_TOKEN_MAX_AGE}`;

    req.res.setHeader('Set-Cookie', [accessTokenCookie]);
  }

  resetJwtCookies(req: Request): void {
    req.res.setHeader('Set-Cookie', [
      `accessToken=; HttpOnly; Path=/; Max-Age=0`,
    ]);
  }

  private generateJwtToken(
    user: ResponseUserDto,
    options?: JwtSignOptions,
  ): string {
    const rest: Partial<ResponseUserDto> = omit(classToPlain(user), [
      'iat',
      'exp',
    ]);
    return this.jwtService.sign(rest, options);
  }
}
