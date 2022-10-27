import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import { CreateCollectionDto, UpdateCollectionDto } from './collection.dto';
import { CollectionService } from './collection.service';
import { CollectionEntity } from './entities/collection.entity';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';
import { RequestUser } from '../../shared/decorators';
import { OkResponseDto } from '../../shared/dto';
import { IsUserGuard } from '../auth/guards/is-user.guard';
import { RequestUserDto } from '../user/user.dto';

@UseGuards(AuthJwtGuard, IsUserGuard)
@Controller('collection')
export class CollectionController {
  private readonly logger = new Logger(CollectionController.name);

  @Get()
  async findMany(
    @RequestUser() { sportclubId }: RequestUserDto,
  ): Promise<CollectionEntity[]> {
    this.logger.log(`sportclubId: ${sportclubId}`);

    const qResult = await firstValueFrom(
      this.collectionService.findMany(sportclubId),
    );
    this.logger.log(`${JSON.stringify(qResult)}`);

    return qResult;
  }

  constructor(private readonly collectionService: CollectionService) {}

  @Get(':id')
  findOne(@Param('id') id: string): Observable<CollectionEntity> {
    return this.collectionService.findOne({ id });
  }

  @Post()
  create(@Body() payload: CreateCollectionDto): Observable<CollectionEntity> {
    return this.collectionService.create(payload);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() payload: UpdateCollectionDto,
  ): Observable<CollectionEntity> {
    return this.collectionService.update(id, payload);
  }

  @Delete(':id')
  delete(
    @RequestUser() user: RequestUserDto,
    @Param('id') id: string,
  ): Observable<OkResponseDto> {
    return this.collectionService.delete(user, id);
  }
}
