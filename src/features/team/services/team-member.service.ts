import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { TeamMemberRepository } from '../repositories/team-member.repository';

@Injectable()
export class TeamMemberService {
  constructor(private readonly teamMemberRepository: TeamMemberRepository) {}

  deleteTeamMembers(teamId: string): Observable<any> {
    return from(this.teamMemberRepository.deleteMembers(teamId));
  }

  deleteMemberTeams(memberId: string): Observable<any> {
    return from(this.teamMemberRepository.deleteTeams(memberId));
  }
}
