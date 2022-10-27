import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { entitiesToDtos } from '../../shared/mapping';
import { MemberEntity } from './entities/member.entity';
import {
  CreateMemberDto,
  ResponseMemberDto,
  UpdateMemberDto,
} from './member.dto';
import { MemberService } from './member.service';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';
import { RequestUser } from '../../shared/decorators';
import { IsUserGuard } from '../auth/guards/is-user.guard';
import { RequestUserDto } from '../user/user.dto';

@UseGuards(AuthJwtGuard, IsUserGuard)
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  findMany(
    @RequestUser() user: RequestUserDto,
  ): Observable<ResponseMemberDto[]> {
    return this.memberService
      .findMany(user)
      .pipe(map((members) => entitiesToDtos(members, ResponseMemberDto)));
  }

  @Get('team/:teamId')
  findTeamMembers(
    @RequestUser() user: RequestUserDto,
    @Param('teamId') teamId: string,
  ) {
    return this.memberService
      .findTeamMembers(user, teamId)
      .pipe(map((members) => entitiesToDtos(members, ResponseMemberDto)));
  }

  @Get('/:id')
  findOne(
    @RequestUser() user: RequestUserDto,
    @Param('id') id: string,
  ): Observable<MemberEntity> {
    return this.memberService.findOne(user, { id });
  }

  @Post()
  create(
    @RequestUser() user: RequestUserDto,
    @Body() payload: CreateMemberDto,
  ): Observable<MemberEntity> {
    return this.memberService.create(user, payload);
  }

  @Patch('/:id')
  update(
    @RequestUser() user: RequestUserDto,
    @Param('id') id: string,
    @Body() payload: UpdateMemberDto,
  ): Observable<MemberEntity> {
    return this.memberService.update(user, id, payload);
  }

  @Post('lookup')
  lookupMembers(
    @RequestUser() user: RequestUserDto,
    @Body() payload: string[],
  ): Observable<MemberEntity[]> {
    return this.memberService.lookup(user, payload);
  }

  @Delete('/:id')
  delete(@RequestUser() user: RequestUserDto, @Param('id') id: string) {
    return this.memberService.delete(user, id);
  }
}
