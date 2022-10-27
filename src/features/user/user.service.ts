import { Injectable } from '@nestjs/common';
import { concatMap, forkJoin, from, map, Observable, of, tap } from 'rxjs';
import { FindConditions, FindOneOptions } from 'typeorm';
import { throwConflictError } from '../../shared/errors';
import { generatePasswordHash } from '../../shared/services';
import { SportclubService } from '../sportclub/services/sportclub.service';
import { CreateUserDto } from './user.dto';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sportclubService: SportclubService,
  ) {}

  findOne(
    conditions: FindConditions<UserEntity>,
    options?: FindOneOptions<UserEntity>,
  ): Observable<UserEntity> {
    return from(this.userRepository.findOne(conditions, options));
  }

  create(payload: CreateUserDto): Observable<UserEntity> {
    return this.findOne({ email: payload.email }, { select: ['email'] }).pipe(
      tap(
        (user) =>
          user &&
          throwConflictError(
            `User with email ${payload.email} already exists.`,
          ),
      ),
      concatMap(() => generatePasswordHash(payload.password)),
      concatMap((password) => {
        const entity = this.userRepository.create({ ...payload, password });

        return from(this.userRepository.save(entity));
      }),
      concatMap((user) =>
        forkJoin([
          of(user),
          this.sportclubService.createUserSportclub(user.id),
        ]),
      ),
      map(([user]) => user),
    );
  }
}
