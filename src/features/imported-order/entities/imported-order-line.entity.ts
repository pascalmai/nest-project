import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { ArticleEntity } from '../../article/entities/article.entity';
import { ArticleSizeEntity } from '../../article/entities/article-size.entity';
import { ImportedOrderEntity } from './imported-order.entity';
import { ImportedOrderLinePrintTemplateEntity } from './imported-order-line-print-template.entity';

@Entity('ac_imported_order_line')
export class ImportedOrderLineEntity extends ACEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'article_id', type: 'uuid' })
  articleId: string;

  @Column({ name: 'article_size_id', type: 'uuid' })
  articleSizeId: string;

  @Column({ type: 'int2', nullable: true, default: 0 })
  amount: number;

  @Column({ name: 'print_number', nullable: true, length: 64 })
  printNumber: string;

  @Column({ name: 'print_text', nullable: true, length: 64 })
  printText: string;

  @Column({ name: 'font_family', nullable: true, length: 64 })
  fontFamily: string;

  @Column({ name: 'font_color', nullable: true, length: 64 })
  fontColor: string;

  @Column({ name: 'text_view', nullable: true, length: 64 })
  textView: string;

  @Column({ name: 'item_description', nullable: true, length: 64 })
  itemDescription: string;

  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
    default: 0,
  })
  price: number;

  @ManyToOne(() => ImportedOrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: ImportedOrderEntity;

  @ManyToOne(() => ArticleEntity)
  @JoinColumn({ name: 'article_id' })
  article: ArticleEntity;

  @ManyToOne(() => ArticleSizeEntity)
  @JoinColumn({ name: 'article_size_id' })
  articleSize: ArticleSizeEntity;

  @OneToMany(
    () => ImportedOrderLinePrintTemplateEntity,
    (importedOrderLinePrintTemplate) => importedOrderLinePrintTemplate.order,
    {
      cascade: true,
    },
  )
  importedOrderLinePrintTemplate: ImportedOrderLinePrintTemplateEntity[];
}
