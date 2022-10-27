import { ACEntity } from '../../shared/entities';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OrderEntity } from '../order/entities/order.entity';
import { ImportedOrderEntity } from '../imported-order/entities/imported-order.entity';

@Entity('ac_note')
export class NoteEntity extends ACEntity {
  @Column({ name: 'order_id', nullable: true, type: 'uuid' })
  orderId?: string;

  @Column({ name: 'imported_order_id', nullable: true, type: 'uuid' })
  importedOrderId?: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  content?: string;

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => ImportedOrderEntity)
  @JoinColumn({ name: 'imported_order_id' })
  importedOrder: ImportedOrderEntity;
}
