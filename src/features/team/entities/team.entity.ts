import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { CollectionEntity } from '../../collection/entities/collection.entity';
import { SportclubEntity } from '../../sportclub/entities/sportclub.entity';
import { TeamMemberEntity } from './team-member.entity';

@Entity('ac_team')
export class TeamEntity extends ACEntity {
  @Column({ type: 'uuid', name: 'sportclub_id' })
  sportclubId: string;

  @Column({ nullable: true, length: 64 })
  name: string;

  @Column({ nullable: true, length: 64 })
  description: string;

  @Column({ type: 'uuid', name: 'standard_collection_id', nullable: true })
  standardCollectionId: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  @ManyToOne(() => SportclubEntity, (sportclub) => sportclub.teams)
  @JoinColumn({ name: 'sportclub_id' })
  sportclub: SportclubEntity;

  @OneToMany(() => TeamMemberEntity, (teamMember) => teamMember.team, {
    cascade: true,
  })
  teamMembers: TeamMemberEntity[];

  @OneToMany(() => CollectionEntity, (collection) => collection.team)
  collections: CollectionEntity[];
}
