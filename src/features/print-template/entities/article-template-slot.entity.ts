import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { ArticleEntity } from '../../article/entities/article.entity';

@Entity('ac_article_template_slot')
export class ArticleTemplateSlotEntity extends ACEntity {
  @Column({ length: 64 })
  name: string;

  @Column({ name: 'article_id', type: 'uuid' })
  articleId: string;

  @ManyToOne(() => ArticleEntity)
  @JoinColumn({ name: 'article_id', referencedColumnName: 'id' })
  article: ArticleEntity;
}
