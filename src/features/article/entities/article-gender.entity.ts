import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { ACGenderEnum } from '../../../shared/enums';
import { ArticleSizeEntity } from './article-size.entity';
import { ArticleEntity } from './article.entity';

@Entity('ac_article_gender')
export class ArticleGenderEntity extends ACEntity {
  @Column({ name: 'article_id', type: 'uuid' })
  articleId: string;

  @Column({ type: 'enum', enum: ACGenderEnum, nullable: true })
  gender: ACGenderEnum;

  @Column({ name: 'cdn_image_name', length: 64 })
  cdnImageName: string;

  @Column({ name: 'purchase_price', type: 'numeric', precision: 6, scale: 2 })
  purchasePrice: number;

  @Column({ type: 'numeric', precision: 6, scale: 2 })
  price: number;

  @ManyToOne(() => ArticleEntity, (article) => article.genders)
  @JoinColumn({ name: 'article_id' })
  article: ArticleEntity;

  @OneToMany(() => ArticleSizeEntity, (size) => size.gender)
  sizes: ArticleSizeEntity[];
}
