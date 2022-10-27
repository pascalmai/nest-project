import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import get from 'lodash/get';
import { concatMap, map, Observable, of, tap } from 'rxjs';
import { throwNotFoundError, throwUnathorizedError } from '../../shared/errors';
import { entityToDto } from '../../shared/mapping';
import { comparePassword } from '../../shared/services';
import { JwtCookieService } from '../jwt-cookie/jwt-cookie.service';
import { CreateUserDto, ResponseUserDto } from '../user/user.dto';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { LoginDto, LoginResponseDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtCookieService: JwtCookieService,
  ) {}

  register(payload: CreateUserDto): Observable<UserEntity> {
    return this.userService.create(payload);
  }

  login(req: Request, payload: LoginDto): Observable<LoginResponseDto> {
    return this.userService
      .findOne({ email: payload.email }, { relations: ['sportclubs'] })
      .pipe(
        tap(
          (user) =>
            !user &&
            throwNotFoundError(`User with email ${payload.email} not found.`),
        ),
        concatMap((user) => {
          return comparePassword(payload.password, user.password).pipe(
            tap(
              (isValid) =>
                !isValid && throwUnathorizedError(`Invalid user password`),
            ),
            map(() => user),
          );
        }),
        map((user) => {
          const { id, email, name, isAdmin, sportclubs } = user;
          const responseUser = entityToDto(
            {
              id,
              email,
              name,
              isAdmin,
              sportclubId: get(sportclubs, `[0].id`),
            },
            ResponseUserDto,
          );

          const accessToken =
            this.jwtCookieService.generateAccessToken(responseUser);
          this.jwtCookieService.setJwtCookies(req, accessToken);
          (req as any).user = responseUser;
          return { accessToken };
        }),
      );
  }

  whoAmI(req: Request): Observable<any> {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!this.jwtCookieService.verifyToken(token)) {
      throwUnathorizedError(`Expired token`);
    }

    const user = this.jwtCookieService.decodeToken(token);

    return of({ user });
  }
}
