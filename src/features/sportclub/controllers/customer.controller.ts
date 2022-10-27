import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { Observable } from 'rxjs';
import { SportclubEntity } from '../entities/sportclub.entity';
import { OkResponseDto } from '../../../shared/dto';
import { GetCustomersDto } from '../customer.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('customer')
export class CustomerController {
  private readonly logger = new Logger(CustomerController.name);

  constructor(private readonly customerService: CustomerService) {}

  @Get('default')
  createDefaultSportClub() {
    this.logger.log('createDefaultSportClub');
    return this.customerService.createDefaultSportclub();
  }

  @Get()
  findMany(@Query() params: GetCustomersDto): Observable<SportclubEntity[]> {
    return this.customerService.findMany(params);
  }

  @Get('/:id')
  findOne(@Param('id') id: string): Observable<SportclubEntity> {
    return this.customerService.findOne(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('photos'))
  create(
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Body() payload: any,
  ): Observable<SportclubEntity> {
    this.logger.log('payload', payload);
    this.logger.log('photos', photos.length);

    return this.customerService.create(payload, photos);
  }

  @Patch('/:id')
  @UseInterceptors(FilesInterceptor('photos'))
  update(
    @Param('id') id: string,
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Body() payload: any,
  ): any {
    this.logger.log(`id: ${JSON.stringify(id)}`);
    this.logger.log(`photos: ${JSON.stringify(photos)}`);
    this.logger.log(`payload: ${JSON.stringify(payload)}`);

    return this.customerService.update(id, payload, photos);
  }

  @Delete('/:id')
  delete(@Param('id') id: string): Observable<OkResponseDto> {
    return this.customerService.delete(id);
  }
}
