import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './team.controller';
import { TeamRepository } from './repositories/team.repository';
import { TeamService } from './services/team.service';
import { TeamMemberRepository } from './repositories/team-member.repository';
import { TeamMemberService } from './services/team-member.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamRepository, TeamMemberRepository])],
  controllers: [TeamController],
  providers: [TeamService, TeamMemberService],
  exports: [TeamService, TeamMemberService],
})
export class TeamModule {}
