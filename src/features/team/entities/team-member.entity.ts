import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { MemberEntity } from '../../member/entities/member.entity';
import { TeamEntity } from './team.entity';

@Entity('ac_member_team')
export class TeamMemberEntity extends ACEntity {
  @Column({ name: 'member_id', type: 'uuid' })
  memberId: string;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity;
}
