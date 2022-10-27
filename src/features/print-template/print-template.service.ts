import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import {
  catchError,
  concatMap,
  forkJoin,
  from,
  map,
  Observable,
  of,
} from 'rxjs';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import flatMap from 'lodash/flatMap';
import { ArticleTemplateSlotEntity } from './entities/article-template-slot.entity';
import { PrintTemplateEntity } from './entities/print-template.entity';
import { ArticleTemplateSlotRepository } from './repositories/article-template-slot.repository';
import { PrintTemplateRepository } from './repositories/print-template.repository';
import { GetCollectionTemplateQueryDto } from './print-template.dto';
import { uploadFilesPath } from '../../shared/constants';
import { ImageSlot } from '../../shared/enums';
import { OkResponseDto } from '../../shared/dto';
import { CreatePrintTemplateDto } from './create-print-template.dto';

const slotNames = [
  ImageSlot.FRONT_MAIN,
  ImageSlot.FRONT_ADDITIONAL,
  ImageSlot.BACK_MAIN,
  ImageSlot.BACK_ADDITIONAL,
  ImageSlot.SIDE_LEFT,
  ImageSlot.SIDE_RIGHT,
];

@Injectable()
export class PrintTemplateService {
  private readonly logger = new Logger(PrintTemplateService.name);

  constructor(
    private readonly printTemplateRepository: PrintTemplateRepository,
    private readonly templateSlotRepository: ArticleTemplateSlotRepository,
  ) {}

  findArticleSlots(articleId: string): Observable<ArticleTemplateSlotEntity[]> {
    const articleSlots = this.templateSlotRepository.find({ articleId });

    this.logger.log(`article slots result: ${JSON.stringify(articleSlots)}`);

    return from(articleSlots);
  }

  create(
    images: any[],
    payload: CreatePrintTemplateDto,
  ): Observable<PrintTemplateEntity[]> {
    const { collectionId, articleId, items, font } = payload;

    // update only font
    if (font && isEmpty(items)) {
      return this.updateTemplatesFont(font, collectionId, articleId);
    }

    const itemsList =
      items !== null
        ? isArray(items)
          ? items.map((c) => JSON.parse(c.toString()))
          : [JSON.parse(items)]
        : [];

    this.logger.log(`payload item parsing result: ${JSON.stringify(items)}`);

    const entities = this.printTemplateRepository.create(
      itemsList.map((item, index) => ({
        ...item,
        imageName: get(images, `[${index}].filename`),
        collectionId,
        articleId,
      })),
    );

    const tasks: Observable<any>[] = [];

    entities.forEach(({ imageSlot, collectionId, articleId }) => {
      tasks.push(
        this.removeExistingImages(imageSlot, collectionId, articleId),
        this.removeExistingSlots(imageSlot, collectionId, articleId),
      );
    });

    return forkJoin(tasks).pipe(
      concatMap(() => from(this.printTemplateRepository.save(entities))),
      concatMap((entities) =>
        this.updateTemplatesFont(
          get(entities, '[0].font'),
          collectionId,
          articleId,
        ),
      ),
    );
  }

  findCollectionTemplates(
    payload: GetCollectionTemplateQueryDto,
  ): Observable<PrintTemplateEntity[]> {
    const templates = this.printTemplateRepository.find(payload);

    this.logger.log(`find collection templates result: ${templates}`);

    return from(templates);
  }

  deleteTemplatesForCollectionArticles(
    collectionId: string,
    articleIds: string[],
  ) {
    const items = flatMap(
      articleIds.map((articleId) =>
        slotNames.map((slotName) => ({ slotName, articleId, collectionId })),
      ),
    );

    const tasks: Observable<any>[] = [];

    items.forEach(({ slotName, collectionId, articleId }) => {
      tasks.push(
        this.removeExistingImages(slotName, collectionId, articleId),
        this.removeExistingSlots(slotName, collectionId, articleId),
      );
    });

    return forkJoin(tasks);
  }

  private updateTemplatesFont(
    font: string,
    collectionId: string,
    articleId: string,
  ): Observable<PrintTemplateEntity[]> {
    return from(
      this.printTemplateRepository.count({ collectionId, articleId }),
    ).pipe(
      concatMap((templateCount) =>
        templateCount
          ? from(
              this.printTemplateRepository.update(
                { collectionId, articleId },
                { font },
              ),
            )
          : from(
              this.printTemplateRepository.save({
                collectionId,
                articleId,
                font,
              }),
            ),
      ),
      concatMap(() =>
        this.findCollectionTemplates({ collectionId, articleId }),
      ),
    );
  }

  private removeExistingImages(
    imageSlot: string,
    collectionId: string,
    articleId: string,
  ): Observable<OkResponseDto> {
    return from(
      this.printTemplateRepository.find({ imageSlot, collectionId, articleId }),
    ).pipe(
      concatMap((entities) => {
        if (!entities || !entities.length) {
          return of({});
        }

        return forkJoin(
          entities.map((entity) => {
            const filePath = path.join(uploadFilesPath, entity.imageName);

            return from(fsp.access(filePath, fs.constants.F_OK)).pipe(
              map(() => fsp.unlink(filePath)),
              catchError(() => {
                // No photo found
                return of({ ok: true });
              }),
            );
          }),
        );
      }),
      map(() => ({ ok: true })),
    );
  }

  private removeExistingSlots(
    imageSlot: string,
    collectionId: string,
    articleId: string,
  ) {
    const qb = this.printTemplateRepository.createQueryBuilder('printTemplate');
    qb.where({
      collectionId,
      articleId,
    }).andWhere(
      '(printTemplate.image_slot IS NULL OR printTemplate.image_slot = :imageSlot)',
      { imageSlot }
    );

    return from(qb.getMany()).pipe(
      concatMap((items) =>
        !isEmpty(items)
          ? forkJoin([
              ...items.map((item) =>
                from(this.printTemplateRepository.delete({ id: item.id })),
              ),
            ])
          : of({}),
      ),
    );
  }
}
