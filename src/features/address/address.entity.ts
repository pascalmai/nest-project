import { Column, Entity } from 'typeorm';
import { ACEntity } from '../../shared/entities';

@Entity('ac_address')
export class AddressEntity extends ACEntity {
  @Column({ name: 'address_line_1', length: 64, nullable: true })
  addressLine1?: string;

  @Column({ name: 'address_line_2', length: 64, nullable: true })
  addressLine2?: string;

  @Column({ length: 64 })
  street: string;

  @Column({ name: 'house_number', length: 10 })
  houseNumber: string;

  @Column({ name: 'postal_code', length: 10 })
  postalCode: string;

  @Column({ name: 'city', length: 10 })
  city: string;
}
