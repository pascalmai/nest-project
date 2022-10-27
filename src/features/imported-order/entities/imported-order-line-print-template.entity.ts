import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { ImportedOrderLineEntity } from './imported-order-line.entity';


@Entity('ac_imported_order_line_print_template')
export class ImportedOrderLinePrintTemplateEntity extends ACEntity {
  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'image_view' })
  imageView: string;

  @Column({ name: 'image_field' })
  imageField: string;

  @Column({ name: 'order_line_id', type: 'uuid' })
  orderLineId: string;

  @ManyToOne(() => ImportedOrderLineEntity)
  @JoinColumn({ name: 'order_line_id' })
  order: ImportedOrderLineEntity;
}