import { Injectable } from '@nestjs/common';
import get from 'lodash/get';
import { from, map, Observable, tap, concatMap } from 'rxjs';
import { FindConditions } from 'typeorm';
import { ArticleSizeDto, UpdateArticleDto } from './article-size.dto';
import { ArticleSizeEntity } from './entities/article-size.entity';
import { ArticleSizeRepository } from './repositories/article-size.repository';
import { throwNotFoundError } from '../../shared/errors';

@Injectable()
export class ArticleSizeService {
  constructor(private readonly articleSizeRepository: ArticleSizeRepository) {}

  findMany(): Observable<ArticleSizeEntity[]> {
    return from(
      this.articleSizeRepository
        .createQueryBuilder('articleSize')
        .leftJoin('articleSize.gender', 'gender')
        .select([
          `articleSize.id`,
          `articleSize.ean`,
          `articleSize.availableFrom`,
          `articleSize.availableTo`,
          `articleSize.weightInKg`,
          `articleSize.volumneInLiter`,
          `gender.cdnImageName`,
        ])
        .orderBy('articleSize.id', 'ASC')
        .getMany(),
    );
  }

  findOne(
    conditions: FindConditions<ArticleSizeEntity>,
  ): Observable<ArticleSizeDto> {
    return from(
      this.articleSizeRepository
        .createQueryBuilder('articleSize')
        .where(conditions)
        .leftJoin('articleSize.gender', 'gender')
        .select([
          `articleSize.id`,
          `articleSize.ean`,
          `articleSize.availableFrom`,
          `articleSize.availableTo`,
          `articleSize.weightInKg`,
          `articleSize.volumneInLiter`,
        ])
        .getOne(),
    ).pipe(
      map((entity) => ({
        id: get(entity, 'id'),
        ean: get(entity, 'ean'),
        availableFrom: get(entity, 'availableFrom'),
        availableTo: get(entity, 'availableTo'),
        weightInKg: get(entity, 'weightInKg'),
        volumneInLiter: get(entity, 'volumneInLiter'),
      })),
    );
  }

  update(id: string, payload: UpdateArticleDto): Observable<ArticleSizeEntity> {
    return from(this.articleSizeRepository.findOne({ id })).pipe(
      tap(
        (articleSize) =>
          !articleSize &&
          throwNotFoundError(`Article Size with id=${id} not found!`),
      ),
      concatMap((articleSize) => {
        return from(
          this.articleSizeRepository.save({
            ...articleSize,
            ...payload,
          }),
        );
      }),
    );
  }
}
