import { Injectable } from '@nestjs/common';
import groupBy from 'lodash/groupBy';
import omit from 'lodash/omit';
import get from 'lodash/get';
import { from, map, Observable, tap, concatMap } from 'rxjs';
import { FindConditions, In } from 'typeorm';
import {
  ArticleWithIdentResponseDto,
  GetArticlesDto,
  UpdateArticleDto,
} from './article.dto';
import { ArticleEntity } from './entities/article.entity';
import { ArticleRepository } from './repositories/article.repository';
import { throwNotFoundError } from '../../shared/errors';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  findMany(params: GetArticlesDto): Observable<ArticleEntity[]> {
    const condition = params.category
      ? `category.ident = '${params.category}'`
      : {};

    return from(
      this.articleRepository
        .createQueryBuilder('article')
        .leftJoin('article.genders', 'genders')
        .leftJoin('article.jakoCategories', 'jakoCategory')
        .leftJoin('jakoCategory.category', 'category')
        .where(condition)
        .select([
          `article.id`,
          `article.name`,
          `article.jakoId`,
          `article.jakoColorCode`,
          `article.jakoColorDescription`,
          `article.articleType`,
          `genders.id`,
          `genders.cdnImageName`,
          `genders.price`,
          'jakoCategory.id',
          `category.ident`,
        ])
        .orderBy('article.name', 'ASC')
        .getMany(),
    ).pipe(
      map((entities) =>
        entities.map(
          (entity) =>
            ({
              ...entity,
              categoryIdent: get(entity.jakoCategories, '[0].category.ident'),
            } as ArticleEntity),
        ),
      ),
    );
  }

  findOne(
    conditions: FindConditions<ArticleEntity>,
  ): Observable<ArticleWithIdentResponseDto> {
    return from(
      this.articleRepository
        .createQueryBuilder('article')
        .where(conditions)
        .leftJoin('article.jakoCategories', 'jakoCategory')
        .leftJoin('jakoCategory.category', 'category')
        .select([
          'article.id',
          'article.name',
          'article.jakoColorCode',
          'article.jakoColorDescription',
          'article.articleType',
          'jakoCategory.id',
          'category.id',
          'category.ident',
        ])
        .getOne(),
    ).pipe(
      map((entity) => ({
        id: get(entity, 'id'),
        name: get(entity, 'name'),
        jakoColorCode: get(entity, 'jakoColorCode'),
        jakoColorDescription: get(entity, 'jakoColorDescription'),
        articleType: get(entity, 'articleType'),
        categoryIdent: get(entity.jakoCategories, '[0].category.ident'),
      })),
    );
  }

  lookupArticles(ids: string[]): Observable<ArticleEntity[]> {
    return from(
      this.articleRepository
        .createQueryBuilder('article')
        .where({ id: In(ids) })
        .leftJoinAndSelect('article.genders', 'gender')
        .leftJoinAndSelect('gender.sizes', 'size')
        .leftJoin('article.jakoCategories', 'jakoCategory')
        .leftJoin('jakoCategory.category', 'category')
        .select([
          'article.id',
          'article.name',
          'article.jakoId',
          'article.jakoColorCode',
          'article.jakoColorDescription',
          'gender.id',
          'gender.gender',
          'gender.cdnImageName',
          'gender.price',
          'size.id',
          'size.jakoSizeId',
          'jakoCategory.id',
          'category.id',
          'category.ident',
        ])
        .getMany(),
    ).pipe(
      map((entities) =>
        entities.map(
          (entity) =>
            ({
              ...omit(entity, 'jakoCategories'),
              categoryIdent: get(entity.jakoCategories, '[0].category.ident'),
            } as ArticleEntity),
        ),
      ),
    );
  }

  findColorCodes(ids: string[]): Observable<any> {
    return from(this.articleRepository.findColorCodes(ids)).pipe(
      map((result) => groupBy(result, 'jakoId')),
    );
  }

  updateOne(id: string, payload: UpdateArticleDto): Observable<ArticleEntity> {
    return from(this.articleRepository.findOne({ id })).pipe(
      tap(
        (article) =>
          !article && throwNotFoundError(`Article with id=${id} not found!`),
      ),
      concatMap((article) => {
        return from(
          this.articleRepository.save({
            ...article,
            ...payload,
          }),
        );
      }),
    );
  }
}
