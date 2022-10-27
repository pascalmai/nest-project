import { ACEntity } from '../../shared/entities';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OrderEntity } from '../order/entities/order.entity';
import { ImportedOrderEntity } from '../imported-order/entities/imported-order.entity';

@Entity('ac_additional_order')
export class AdditionalOrderEntity extends ACEntity {
  @Column({ name: 'order_id', nullable: true, type: 'uuid' })
  orderId?: string;

  @Column({ name: 'imported_order_id', nullable: true, type: 'uuid' })
  importedOrderId?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'int2' })
  amount: number;

  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
  })
  price: number;

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => ImportedOrderEntity)
  @JoinColumn({ name: 'imported_order_id' })
  importedOrder: ImportedOrderEntity;
}
