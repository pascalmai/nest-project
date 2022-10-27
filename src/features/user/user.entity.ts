import { Column, Entity, OneToMany } from 'typeorm';
import { ACEntity } from '../../shared/entities';
import { SportclubEntity } from '../sportclub/entities/sportclub.entity';

@Entity('ac_user')
export class UserEntity extends ACEntity {
  @Column({ length: 64, nullable: true })
  name: string;

  @Column({ length: 64 })
  email: string;

  @Column({ length: 64 })
  password: string;

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin: boolean;

  @OneToMany(() => SportclubEntity, (sportclub) => sportclub.owner)
  sportclubs: SportclubEntity[];
}
