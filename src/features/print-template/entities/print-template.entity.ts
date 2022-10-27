import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { ArticleEntity } from '../../article/entities/article.entity';
import { CollectionEntity } from '../../collection/entities/collection.entity';

@Entity('ac_print_template')
export class PrintTemplateEntity extends ACEntity {
  @Column({ length: 64 })
  font: string;

  @Column({ name: 'image_name', length: 64, nullable: true })
  imageName: string;

  @Column({ name: 'image_slot', length: 64, nullable: true })
  imageSlot: string;

  @Column({ name: 'collection_id', type: 'uuid' })
  collectionId: string;

  @Column({ name: 'article_id', type: 'uuid' })
  articleId: string;

  @ManyToOne(() => CollectionEntity)
  @JoinColumn({ name: 'collection_id', referencedColumnName: 'id' })
  collection: CollectionEntity;

  @ManyToOne(() => ArticleEntity)
  @JoinColumn({ name: 'article_id', referencedColumnName: 'id' })
  article: ArticleEntity;
}
