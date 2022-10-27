import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { ImportedOrderLineEntity } from './imported-order-line.entity';
import { AC_ORDER_STATUS } from '../../../shared/enums';
import { AddressEntity } from '../../address/address.entity';
import { SportclubEntity } from '../../sportclub/entities/sportclub.entity';
import { AdditionalOrderEntity } from '../../additional-order/additional-order.entity';
import { NoteEntity } from '../../note/note.entity';

@Entity('ac_imported_order')
export class ImportedOrderEntity extends ACEntity {
  @Column({ name: 'order_number', length: '64', nullable: true, unique: true })
  orderNumber: string;

  @Column({ name: 'invoice_number' })
  invoiceNumber: number;

  @ManyToOne(() => SportclubEntity)
  @JoinColumn({ name: 'sportclub_id' })
  sportclub: SportclubEntity;

  @Column({ name: 'sportclub_id', type: 'uuid' })
  sportclub_id: string;

  @Column({ type: 'integer', nullable: true })
  discount: number;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'shipping_address_id', type: 'uuid', nullable: true })
  shippingAddressId: string;

  @OneToMany(() => ImportedOrderLineEntity, (orderLine) => orderLine.order, {
    cascade: true,
  })
  orderLines: ImportedOrderLineEntity[];

  @OneToMany(
    () => AdditionalOrderEntity,
    (additionalOrderLine) => additionalOrderLine.importedOrder,
    {
      cascade: true,
    },
  )
  additionalOrders: AdditionalOrderEntity[];

  @OneToMany(() => NoteEntity, (note) => note.importedOrder, {
    cascade: true,
  })
  notes: NoteEntity[];

  @OneToOne(() => AddressEntity, { cascade: true })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: AddressEntity;

  @Column({ select: false, insert: false })
  itemsCount?: number;

  @Column({ select: false, insert: false })
  totalPrice?: number;

  @Column({ select: false, insert: false })
  haveImages?: boolean;
}
