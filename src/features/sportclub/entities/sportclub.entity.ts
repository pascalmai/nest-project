import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { TeamEntity } from '../../team/entities/team.entity';
import { UserEntity } from '../../user/user.entity';
import { SportclubContactEntity } from './sportclub-contact.entity';
import { AddressEntity } from '../../address/address.entity';
import { ImportedOrderEntity } from '../../imported-order/entities/imported-order.entity';

@Entity('ac_sportclub')
export class SportclubEntity extends ACEntity {
  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId: string;

  @Column({ length: 64, nullable: true })
  name: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ name: 'invoice_address_id', type: 'uuid' })
  invoiceAddressId: string;

  @Column({ name: 'shipping_address_id', type: 'uuid' })
  shippingAddressId: string;

  @Column({ name: 'jako_customer_number', length: 64, nullable: true })
  jakoCustomerNumber: string;

  @Column({ name: 'customer_number', generated: 'increment' })
  customerNumber: number;

  @Column({ name: 'team_shop_name', length: 64, nullable: true })
  teamShopName: string;

  @Column()
  discount: number;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.sportclubs)
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @OneToMany(() => SportclubContactEntity, (contact) => contact.sportclub, {
    cascade: true,
  })
  contacts: SportclubContactEntity[];

  @OneToMany(() => TeamEntity, (team) => team.sportclub)
  teams: TeamEntity[];

  @OneToMany(
    () => ImportedOrderEntity,
    (importedOrder) => importedOrder.sportclub,
    { cascade: true },
  )
  imported_orders: ImportedOrderEntity[];

  @OneToOne(() => AddressEntity, { cascade: true })
  @JoinColumn({ name: 'invoice_address_id' })
  invoiceAddress: AddressEntity;

  @OneToOne(() => AddressEntity, { cascade: true })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: AddressEntity;

  @Column({ select: false, insert: false })
  customerNumberString: string;
}
