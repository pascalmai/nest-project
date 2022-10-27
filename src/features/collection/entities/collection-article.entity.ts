import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { ArticleEntity } from '../../article/entities/article.entity';
import { CollectionEntity } from './collection.entity';

@Entity('ac_collection_article')
export class CollectionArticleEntity extends ACEntity {
  @Column({ name: 'collection_id', type: 'uuid' })
  collectionId: string;

  @Column({ name: 'article_id', type: 'uuid' })
  articleId: string;

  @ManyToOne(() => CollectionEntity)
  @JoinColumn({ name: 'collection_id' })
  collection: CollectionEntity;

  @ManyToOne(() => ArticleEntity)
  @JoinColumn({ name: 'article_id' })
  article: ArticleEntity;
}
