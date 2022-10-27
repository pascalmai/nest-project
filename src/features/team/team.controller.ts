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
import { CreateTeamDto, ResponseTeamDto, UpdateTeamDto } from './team.dto';
import { TeamEntity } from './entities/team.entity';
import { TeamService } from './services/team.service';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';
import { RequestUser } from '../../shared/decorators';
import { OkResponseDto } from '../../shared/dto';
import { IsUserGuard } from '../auth/guards/is-user.guard';
import { RequestUserDto } from '../user/user.dto';

@UseGuards(AuthJwtGuard, IsUserGuard)
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  findMany(@RequestUser() user: RequestUserDto): Observable<ResponseTeamDto[]> {
    return this.teamService
      .findMany({ sportclubId: user.sportclubId })
      .pipe(map((teams) => entitiesToDtos(teams, ResponseTeamDto)));
  }

  @Get('/:id')
  findOne(
    @RequestUser() user: RequestUserDto,
    @Param('id') id: string,
  ): Observable<TeamEntity> {
    return this.teamService.findOne({ id, sportclubId: user.sportclubId });
  }

  @Post()
  create(@Body() payload: CreateTeamDto): Observable<TeamEntity> {
    return this.teamService.create(payload);
  }

  @Patch('/:id')
  update(
    @RequestUser() user: RequestUserDto,
    @Param('id') id: string,
    @Body() payload: UpdateTeamDto,
  ): Observable<TeamEntity> {
    return this.teamService.update(user, id, payload);
  }

  @Delete('/:id')
  delete(
    @RequestUser() user: RequestUserDto,
    @Param('id') id: string,
  ): Observable<OkResponseDto> {
    return this.teamService.delete(user, id);
  }
}
