import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { ArticleEntity } from '../../article/entities/article.entity';
import { CategoryEntity } from './category.entity';

@Entity('ac_jako_category')
export class JakoCategoryEntity extends ACEntity {
  @Column({ name: 'jako_category_id', length: 64 })
  jakoCategoryId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ length: 64 })
  name: string;

  @ManyToOne(() => CategoryEntity, (category) => category.jakoCategories)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => ArticleEntity, (article) => article.jakoCategories)
  @JoinColumn({
    name: 'jako_category_id',
    referencedColumnName: 'jakoCategoryId',
  })
  article: ArticleEntity;
}
