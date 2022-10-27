import { Injectable } from '@nestjs/common';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import { concatMap, forkJoin, from, map, Observable, of, tap } from 'rxjs';
import { FindConditions } from 'typeorm';
import { throwNotFoundError } from '../../shared/errors';
import { setIfDefined } from '../../shared/services';
import { PrintTemplateService } from '../print-template/print-template.service';
import { TeamService } from '../team/services/team.service';
import { CreateCollectionDto, UpdateCollectionDto } from './collection.dto';
import { CollectionArticleEntity } from './entities/collection-article.entity';
import { CollectionEntity } from './entities/collection.entity';
import { CollectionArticleRepository } from './repositories/collection-article.repository';
import { CollectionRepository } from './repositories/collection.repository';
import { OkResponseDto } from '../../shared/dto';
import { RequestUserDto } from '../user/user.dto';

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly collectionArticleRepository: CollectionArticleRepository,
    private readonly teamService: TeamService,
    private readonly printTemplateService: PrintTemplateService,
  ) {}

  findMany(sportclubId?: string): Observable<CollectionEntity[]> {
    const selectQB = this.collectionRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.team', 'team')
      .select([
        'collection.id',
        'collection.name',
        'team.id',
        'team.name',
        'team.standardCollectionId',
      ])
      .where({ isDeleted: false });

    if (sportclubId) {
      selectQB.andWhere(`team.sportclub_id = '${sportclubId}'`);
    }

    const qResult = selectQB
      .groupBy('team.id')
      .addGroupBy('collection.id')
      .orderBy('team.name', 'ASC')
      .addOrderBy('collection.name', 'ASC')
      .getMany();

    return from(qResult);
  }

  findOne(
    conditions: FindConditions<CollectionEntity>,
  ): Observable<CollectionEntity> {
    return from(
      this.collectionRepository
        .createQueryBuilder('collection')
        .leftJoinAndSelect('collection.team', 'team')
        .leftJoinAndSelect(
          'collection.collectionArticles',
          'collectionArticles',
        )
        .leftJoinAndSelect('collectionArticles.article', 'article')
        .leftJoinAndSelect('article.jakoCategories', 'jakoCategories')
        .leftJoinAndSelect('jakoCategories.category', 'category')
        .leftJoinAndSelect('article.genders', 'genders')
        .where({ isDeleted: false, ...conditions })
        .select([
          'collection.id',
          'collection.name',
          'team.id',
          'team.name',
          'team.standardCollectionId',
          'collectionArticles.id',
          'article.id',
          'article.name',
          'genders.id',
          'genders.cdnImageName',
          'jakoCategories.id',
          'category.ident',
        ])
        .getOne(),
    );
  }

  create(payload: CreateCollectionDto): Observable<CollectionEntity> {
    const { articleIds, isStandard, ...rest } = payload;
    const entity = this.collectionRepository.create(payload);

    if (articleIds) {
      entity.collectionArticles = articleIds.map(
        (articleId) => ({ articleId } as CollectionArticleEntity),
      );
    }

    return from(this.collectionRepository.save(entity)).pipe(
      concatMap((collection) =>
        forkJoin([
          of(collection.id),
          isStandard
            ? this.teamService.updateStandardCollectionId(
                rest.teamId,
                collection.id,
              )
            : of(null),
        ]),
      ),
      concatMap(([id]) => this.findOne({ id })),
    );
  }

  update(
    id: string,
    payload: UpdateCollectionDto,
  ): Observable<CollectionEntity> {
    const fieldsToUpdate = ['name', 'teamId'];
    const { articleIds, isStandard, ...rest } = payload;

    return from(this.findOne({ id })).pipe(
      tap(
        (entity) =>
          !entity && throwNotFoundError(`Collection with id ${id} not found.`),
      ),
      concatMap((entity) => {
        const clonedEntity = cloneDeep(entity);

        fieldsToUpdate.forEach((field) => {
          setIfDefined<CollectionEntity>(clonedEntity, rest, field);
        });

        const tasks: Observable<any>[] = [];

        if (articleIds) {
          const articleIdsToDelete = clonedEntity.collectionArticles.reduce(
            (result, collectionArticle) => {
              const articleId = get(collectionArticle, 'article.id');
              if (!articleIds.includes(articleId)) {
                result.push(articleId);
              }

              return result;
            },
            [],
          );

          clonedEntity.collectionArticles = articleIds.map(
            (articleId) => ({ articleId } as CollectionArticleEntity),
          );

          tasks.push(
            from(this.collectionArticleRepository.deleteCollectionArticles(id)),
          );

          if (!isEmpty(articleIdsToDelete)) {
            tasks.push(
              this.printTemplateService.deleteTemplatesForCollectionArticles(
                id,
                articleIdsToDelete,
              ),
            );
          }
        }

        tasks.push(from(this.collectionRepository.save(clonedEntity)));

        if (payload.hasOwnProperty('isStandard')) {
          tasks.push(
            this.teamService.updateStandardCollectionId(
              rest.teamId,
              isStandard ? id : null,
            ),
          );
        }

        return forkJoin(tasks);
      }),
      concatMap(() => this.findOne({ id })),
    );
  }

  delete(
    { sportclubId }: RequestUserDto,
    id: string,
  ): Observable<OkResponseDto> {
    return from(this.collectionRepository.findOne({ id })).pipe(
      tap(
        (entity) =>
          !entity && throwNotFoundError(`Collection with id ${id} not found.`),
      ),
      concatMap((collection) =>
        forkJoin([
          of(collection),
          this.teamService.isBelongToSportclub(collection.teamId, sportclubId),
        ]),
      ),
      concatMap(([, checkResult]) => {
        if (!checkResult || !checkResult.ok) {
          return of({ ok: false });
        }

        return this.collectionRepository.update(
          { id },
          { isDeleted: true, deletedAt: new Date() },
        );
      }),
      map(() => ({ ok: true })),
    );
  }
}
