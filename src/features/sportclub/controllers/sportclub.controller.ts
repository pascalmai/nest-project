import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { SportclubEntity } from '../entities/sportclub.entity';
import { SportclubService } from '../services/sportclub.service';
import { AuthJwtGuard } from '../../auth/guards/auth-jwt.guard';
import { SportclubContactEntity } from '../entities/sportclub-contact.entity';
import { IsAdminGuard } from '../../auth/guards/is-admin.guard';

@UseGuards(AuthJwtGuard)
@Controller('sportclub')
export class SportclubController {
  constructor(private readonly sportclubService: SportclubService) {}

  @UseGuards(IsAdminGuard)
  @Get('/contact')
  findContacts(
    @Query('jakoCustomerNumber') jakoCustomerNumber: string,
  ): Observable<SportclubContactEntity[]> {
    return this.sportclubService.findContacts(jakoCustomerNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<SportclubEntity> {
    return this.sportclubService.findOne({ id });
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('photos'))
  update(
    @Param('id') id: string,
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Body() payload: any,
  ) {
    return this.sportclubService.update(id, payload, photos);
  }
}
