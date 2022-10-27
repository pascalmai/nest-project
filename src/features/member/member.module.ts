import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamModule } from '../team/team.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { MemberSizeRepository } from './repositories/member-size.repository';
import { MemberRepository } from './repositories/member.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberRepository, MemberSizeRepository]),
    TeamModule,
  ],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
