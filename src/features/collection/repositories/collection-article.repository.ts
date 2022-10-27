import { from, map, Observable } from 'rxjs';
import { EntityRepository, Repository } from 'typeorm';
import { CollectionArticleEntity } from '../entities/collection-article.entity';
import { OkResponseDto } from '../../../shared/dto';

@EntityRepository(CollectionArticleEntity)
export class CollectionArticleRepository extends Repository<CollectionArticleEntity> {
  deleteCollectionArticles(collectionId: string): Observable<OkResponseDto> {
    return from(this.delete({ collectionId })).pipe(map(() => ({ ok: true })));
  }
}
