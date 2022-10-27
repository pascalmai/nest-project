import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';
import { entityToDto } from '../../shared/mapping';
import { CreateUserDto, ResponseUserDto } from '../user/user.dto';
import { LoginDto, LoginResponseDto } from './auth.dto';
import { AuthService } from './auth.service';
import { AuthJwtGuard } from './guards/auth-jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  register(@Body() payload: CreateUserDto): Observable<ResponseUserDto> {
    return this.authService
      .register(payload)
      .pipe(map((user) => entityToDto(user, ResponseUserDto)));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Req() req: Request,
    @Body() payload: LoginDto,
  ): Observable<LoginResponseDto> {
    return this.authService.login(req, payload);
  }

  @UseGuards(AuthJwtGuard)
  @Get('whoami')
  whoAmI(@Req() req: Request) {
    return this.authService.whoAmI(req);
  }
}
