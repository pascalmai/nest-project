import { Column, Entity, OneToMany } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { JakoCategoryEntity } from '../../category/entities/jako-category.entity';
import { ArticleTemplateSlotEntity } from '../../print-template/entities/article-template-slot.entity';
import { ArticleGenderEntity } from './article-gender.entity';
import { PrintTemplateEntity } from '../../print-template/entities/print-template.entity';

@Entity('ac_article')
export class ArticleEntity extends ACEntity {
  @Column({ name: 'jako_id', length: 64 })
  jakoId: string;

  @Column({ length: 64 })
  name: string;

  @Column({ name: 'jako_color_code', length: 64, nullable: true })
  jakoColorCode: string;

  @Column({ name: 'jako_color_description', length: 64, nullable: true })
  jakoColorDescription: string;

  @Column({ name: 'jako_category_id', length: 64 })
  jakoCategoryId: string;

  @Column({ name: 'article_type', length: 256 })
  articleType?: string;

  @OneToMany(() => JakoCategoryEntity, (jakoCategory) => jakoCategory.article)
  jakoCategories: JakoCategoryEntity[];

  @OneToMany(() => ArticleGenderEntity, (gender) => gender.article)
  genders: ArticleGenderEntity[];

  @OneToMany(
    () => ArticleTemplateSlotEntity,
    (templateSlot) => templateSlot.article,
  )
  printTemplateSlots: ArticleTemplateSlotEntity[];

  @OneToMany(
    () => PrintTemplateEntity,
    (printTemplate) => printTemplate.article,
  )
  printTemplates: PrintTemplateEntity[];

  @Column({ select: false, insert: false })
  categoryIdent?: string;
}
