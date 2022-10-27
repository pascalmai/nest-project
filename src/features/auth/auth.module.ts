import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtCookieModule } from '../jwt-cookie/jwt-cookie.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthJwtGuard } from './guards/auth-jwt.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { IsUserGuard } from './guards/is-user.guard';

@Module({
  imports: [PassportModule, UserModule, JwtCookieModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AuthJwtGuard,
    IsAdminGuard,
    IsUserGuard,
  ],
})
export class AuthModule {}
