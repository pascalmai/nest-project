import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { ArticleSizeEntity } from '../../article/entities/article-size.entity';
import { ArticleEntity } from '../../article/entities/article.entity';
import { MemberEntity } from '../../member/entities/member.entity';
import { OrderEntity } from './order.entity';

@Entity('ac_order_line')
export class OrderLineEntity extends ACEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'article_id', type: 'uuid' })
  articleId: string;

  @Column({ name: 'article_size_id', type: 'uuid' })
  articleSizeId: string;

  @Column({ name: 'member_id', type: 'uuid' })
  memberId: string;

  @Column({ type: 'int2', nullable: true, default: 0 })
  amount: number;

  @Column({ name: 'print_number', nullable: true, length: 64 })
  printNumber: string;

  @Column({ name: 'print_text', nullable: true, length: 64 })
  printText: string;

  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
    default: 0,
  })
  price: number;

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => ArticleEntity)
  @JoinColumn({ name: 'article_id' })
  article: ArticleEntity;

  @ManyToOne(() => ArticleSizeEntity)
  @JoinColumn({ name: 'article_size_id' })
  articleSize: ArticleSizeEntity;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}
