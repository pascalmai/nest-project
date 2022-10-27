import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { CollectionEntity } from '../../collection/entities/collection.entity';
import { OrderLineEntity } from './order-line.entity';
import { AC_ORDER_STATUS } from '../../../shared/enums';
import { AdditionalOrderEntity } from '../../additional-order/additional-order.entity';
import { NoteEntity } from '../../note/note.entity';

@Entity('ac_order')
export class OrderEntity extends ACEntity {
  @Column({ name: 'collection_id', type: 'uuid' })
  collectionId: string;

  @Column({ name: 'sportclub_id', type: 'uuid' })
  sportclubId: string;

  @Column({ type: 'integer', nullable: true })
  discount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'order_number',
    generated: 'increment',
    nullable: true,
    unique: true,
  })
  orderNumber: number;

  @Column({ type: 'enum', enum: AC_ORDER_STATUS, default: AC_ORDER_STATUS.NEW })
  status: AC_ORDER_STATUS;

  @Column({ name: 'is_downloaded', type: 'bool', default: false })
  isDownloaded: boolean;

  @Column({ name: 'is_exported', type: 'bool', default: false })
  isExported: boolean;

  @Column({ name: 'exported_timestamp', type: 'timestamptz' })
  exportedTimestamp: Date;

  @Column({ name: 'is_ready_for_export', type: 'bool', default: false })
  isReadyForExport: boolean;

  @ManyToOne(() => CollectionEntity)
  @JoinColumn({ name: 'collection_id' })
  collection: CollectionEntity;

  @OneToMany(() => OrderLineEntity, (orderLine) => orderLine.order, {
    cascade: true,
  })
  orderLines: OrderLineEntity[];

  @OneToMany(
    () => AdditionalOrderEntity,
    (additionalOrderLine) => additionalOrderLine.order,
    {
      cascade: true,
    },
  )
  additionalOrders: AdditionalOrderEntity[];

  @OneToMany(() => NoteEntity, (note) => note.order, {
    cascade: true,
  })
  notes: NoteEntity[];

  @Column({ select: false, insert: false })
  itemsCount?: number;

  @Column({ select: false, insert: false })
  totalPrice?: number;

  @Column({ select: false, insert: false })
  haveImages?: boolean;
}
