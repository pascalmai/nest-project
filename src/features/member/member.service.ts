import { Injectable } from '@nestjs/common';
import cloneDeep from 'lodash/cloneDeep';
import {
  concatMap,
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  of,
  tap,
} from 'rxjs';
import { FindConditions, In } from 'typeorm';
import { throwNotFoundError } from '../../shared/errors';
import { setIfDefined } from '../../shared/services';
import { TeamMemberEntity } from '../team/entities/team-member.entity';
import { TeamMemberService } from '../team/services/team-member.service';
import { MemberEntity } from './entities/member.entity';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';
import { MemberSizeRepository } from './repositories/member-size.repository';
import { MemberRepository } from './repositories/member.repository';
import { OkResponseDto } from '../../shared/dto';
import { RequestUserDto } from '../user/user.dto';

@Injectable()
export class MemberService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly memberSizeRepository: MemberSizeRepository,
    private readonly teamMemberService: TeamMemberService,
  ) {}

  findMany(
    user: any,
    where?: FindConditions<MemberEntity>,
  ): Observable<MemberEntity[]> {
    return from(
      this.memberRepository.find({
        where: { ...where, sportclubId: user.sportclubId, isDeleted: false },
        select: ['id', 'name'],
      }),
    );
  }

  findTeamMembers(
    { sportclubId }: RequestUserDto,
    teamId: string,
  ): Observable<MemberEntity[]> {
    return from(
      this.memberRepository.find({
        where: { sportclubId, isDeleted: false },
        select: ['id', 'name'],
      }),
    );
  }

  findOne(
    { sportclubId }: Partial<RequestUserDto>,
    conditions?: FindConditions<MemberEntity>,
  ): Observable<MemberEntity> {
    return from(
      this.memberRepository.findOne(
        { ...conditions, sportclubId, isDeleted: false },
        {
          relations: ['memberTeams', 'sizes', 'sizes.category'],
        },
      ),
    );
  }

  create(
    { sportclubId }: RequestUserDto,
    payload: CreateMemberDto,
  ): Observable<MemberEntity> {
    const { sizes, selectedTeamIds, ...rest } = payload;

    const entity = this.memberRepository.create({
      ...rest,
      sportclubId,
    });

    if (selectedTeamIds) {
      entity.memberTeams = selectedTeamIds.map(
        (teamId) => ({ teamId } as TeamMemberEntity),
      );
    }

    return from(this.memberRepository.save(entity)).pipe(
      concatMap((member) =>
        forkJoin([
          of(member),
          from(this.memberSizeRepository.saveMemberSizes(member.id, sizes)),
        ]),
      ),
      concatMap(([member]) => this.findOne({ id: member.id })),
    );
  }

  update(
    user: RequestUserDto,
    id: string,
    payload: UpdateMemberDto,
  ): Observable<MemberEntity> {
    const { sizes, selectedTeamIds, ...rest } = payload;
    const fieldsToUpdate = [
      'name',
      'gender',
      'dob',
      'height',
      'jerseyNumber',
      'jerseyText',
    ];

    return this.findOne(user, { id }).pipe(
      tap(
        (member) =>
          !member && throwNotFoundError(`Member with id ${id} not found`),
      ),
      concatMap((member) => {
        const clonedEntity = cloneDeep(member);

        fieldsToUpdate.forEach((field) => {
          setIfDefined<MemberEntity>(clonedEntity, rest, field);
        });

        if (selectedTeamIds) {
          clonedEntity.memberTeams = selectedTeamIds.map(
            (teamId) =>
              ({
                teamId,
                memberId: id,
              } as TeamMemberEntity),
          );
        }

        return from(this.teamMemberService.deleteMemberTeams(id)).pipe(
          mergeMap(() =>
            from(this.memberRepository.save({ id, ...clonedEntity })),
          ),
          tap(
            () =>
              sizes &&
              forkJoin([
                from(this.memberSizeRepository.deleteMemberSizes(id)),
                from(this.memberSizeRepository.saveMemberSizes(id, sizes)),
              ]),
          ),
        );
      }),
    );
  }

  lookup(
    { sportclubId }: RequestUserDto,
    ids: string[],
  ): Observable<MemberEntity[]> {
    return from(
      this.memberRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.sizes', 'size')
        .leftJoinAndSelect('size.category', 'category')
        .where({ sportclubId, isDeleted: false, id: In(ids) })
        .getMany(),
    );
  }

  delete(
    { sportclubId }: RequestUserDto,
    id: string,
  ): Observable<OkResponseDto> {
    return from(this.memberRepository.findOne({ id, sportclubId })).pipe(
      tap(
        (entity) =>
          !entity && throwNotFoundError(`Member with id ${id} not found.`),
      ),
      concatMap(() =>
        forkJoin([
          this.memberRepository.update(
            { id },
            { isDeleted: true, deletedAt: new Date() },
          ),
          from(this.teamMemberService.deleteMemberTeams(id)),
        ]),
      ),
      map(() => ({ ok: true })),
    );
  }
}
