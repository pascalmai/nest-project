import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { SportclubEntity } from './sportclub.entity';

@Entity('ac_sportclub_contact')
export class SportclubContactEntity extends ACEntity {
  @Column({ name: 'sportclub_id', type: 'uuid' })
  sportclubId: string;

  @Column({ name: 'full_name', length: 128, nullable: true })
  fullName?: string;

  @Column({ length: 64, nullable: true })
  phone: string;

  @Column({ length: 64, nullable: true })
  email: string;

  @Column({ length: 64, nullable: true })
  photo: string;

  @ManyToOne(() => SportclubEntity, (sportclub) => sportclub.contacts)
  @JoinColumn({ name: 'sportclub_id' })
  sportclub: SportclubEntity;
}
