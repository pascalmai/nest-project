import { EntityRepository, Repository } from 'typeorm';
import { TeamMemberEntity } from '../entities/team-member.entity';

@EntityRepository(TeamMemberEntity)
export class TeamMemberRepository extends Repository<TeamMemberEntity> {
  deleteTeams(memberId: string) {
    return this.delete({ memberId });
  }

  deleteMembers(teamId: string) {
    return this.delete({ teamId });
  }
}
