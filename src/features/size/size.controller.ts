import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CATEGORY_IDENT } from '../../shared/enums';
import { GetSizesQueryParamsDto, SizeResponseDto } from './size.dto';
import { SizeService } from './size.service';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';

@UseGuards(AuthJwtGuard)
@Controller('size')
export class SizeController {
  constructor(private readonly sizeService: SizeService) {}

  @Get('/:categoryIdent')
  getSizes(
    @Param('categoryIdent') categoryIdent: CATEGORY_IDENT,
    @Query() queryParams: GetSizesQueryParamsDto,
  ): Observable<SizeResponseDto[]> {
    return this.sizeService.getSizes(categoryIdent, queryParams);
  }
}
