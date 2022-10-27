import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { TeamMemberEntity } from '../../team/entities/team-member.entity';
import { MemberSizeEntity } from './member-size.entity';
import { SportclubEntity } from '../../sportclub/entities/sportclub.entity';

@Entity('ac_member')
export class MemberEntity extends ACEntity {
  @Column({ nullable: true, length: 64 })
  name: string;

  @Column({ nullable: true, length: 64 })
  gender: string;

  @Column({ nullable: true })
  dob: Date;

  @Column({ nullable: true, type: 'int2' })
  height: number;

  @Column({ name: 'jersey_number', nullable: true, type: 'int2' })
  jerseyNumber: number;

  @Column({ name: 'jersey_text', nullable: true, length: 64 })
  jerseyText: string;

  @Column({ name: 'sportclub_id', type: 'uuid' })
  sportclubId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  @OneToMany(() => MemberSizeEntity, (size) => size.member, { cascade: true })
  sizes: MemberSizeEntity[];

  @OneToMany(() => TeamMemberEntity, (teamMember) => teamMember.member, {
    cascade: true,
  })
  memberTeams: TeamMemberEntity[];

  @ManyToOne(() => SportclubEntity)
  @JoinColumn({ name: 'sportclub_id' })
  sportclub: SportclubEntity;
}
