import { Injectable } from '@nestjs/common';
import {
  concatMap,
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  tap,
} from 'rxjs';
import { FindConditions } from 'typeorm';
import { throwNotFoundError } from '../../../shared/errors';
import { CreateTeamDto, UpdateTeamDto } from '../team.dto';
import { TeamEntity } from '../entities/team.entity';
import { TeamRepository } from '../repositories/team.repository';
import cloneDeep from 'lodash/cloneDeep';
import { setIfDefined } from '../../../shared/services';
import { TeamMemberRepository } from '../repositories/team-member.repository';
import { OkResponseDto } from '../../../shared/dto';
import { RequestUserDto } from '../../user/user.dto';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly teamMemberRepository: TeamMemberRepository,
  ) {}

  findMany(conditions: FindConditions<TeamEntity>): Observable<TeamEntity[]> {
    return from(this.teamRepository.find({ ...conditions, isDeleted: false }));
  }

  findOne(conditions: FindConditions<TeamEntity>): Observable<TeamEntity> {
    return from(
      this.teamRepository.findOne(
        { ...conditions, isDeleted: false },
        {
          relations: ['teamMembers'],
        },
      ),
    );
  }

  create(payload: CreateTeamDto): Observable<TeamEntity> {
    const { selectedMemberIds, ...rest } = payload;

    const entity = this.teamRepository.create(rest);

    if (selectedMemberIds) {
      entity.teamMembers = this.teamMemberRepository.create(
        payload.selectedMemberIds.map((memberId) => ({
          memberId,
        })),
      );
    }

    return from(this.teamRepository.save(entity));
  }

  update(
    { sportclubId }: RequestUserDto,
    id: string,
    payload: UpdateTeamDto,
  ): Observable<TeamEntity> {
    const fieldsToUpdate = ['name', 'description'];

    return this.findOne({ id, sportclubId }).pipe(
      tap(
        (team) => !team && throwNotFoundError(`Team with id ${id} not found`),
      ),
      concatMap((team) => {
        const teamClone = cloneDeep(team);

        fieldsToUpdate.forEach((field) => {
          setIfDefined<TeamEntity>(teamClone, payload, field);
        });

        if (payload.selectedMemberIds) {
          teamClone.teamMembers = this.teamMemberRepository.create(
            payload.selectedMemberIds.map((memberId) => ({
              teamId: id,
              memberId,
            })),
          );
        }

        return from(this.teamMemberRepository.deleteMembers(id)).pipe(
          mergeMap(() => from(this.teamRepository.save({ id, ...teamClone }))),
        );
      }),
      concatMap(() => this.findOne({ id })),
    );
  }

  updateStandardCollectionId(
    id: string,
    standardCollectionId: string,
  ): Observable<TeamEntity> {
    return this.findOne({ id }).pipe(
      tap(
        (team) => !team && throwNotFoundError(`Team with id ${id} not found`),
      ),
      concatMap((team) => {
        const teamClone = cloneDeep(team);
        teamClone.standardCollectionId = standardCollectionId;

        return from(this.teamRepository.save({ id, ...teamClone }));
      }),
    );
  }

  isBelongToSportclub(
    teamId: string,
    sportclubId: string,
  ): Observable<OkResponseDto> {
    return from(this.teamRepository.findOne({ id: teamId, sportclubId })).pipe(
      tap(
        (team) =>
          !team &&
          throwNotFoundError(
            `Team does not belong to the sportclub with id=${sportclubId} not found`,
          ),
      ),
      map(() => ({ ok: true })),
    );
  }

  delete(
    { sportclubId }: RequestUserDto,
    id: string,
  ): Observable<OkResponseDto> {
    return from(this.teamRepository.findOne({ id, sportclubId })).pipe(
      tap(
        (entity) =>
          !entity && throwNotFoundError(`Team with id ${id} not found.`),
      ),
      concatMap(() =>
        forkJoin([
          this.teamRepository.update(
            { id },
            { isDeleted: true, deletedAt: new Date() },
          ),
          from(this.teamMemberRepository.deleteMembers(id)),
        ]),
      ),
      map(() => ({ ok: true })),
    );
  }
}
