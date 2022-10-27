import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtCookieService } from './jwt-cookie.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory() {
        return {
          secret: process.env.JWT_ACCESS_TOKEN_SECRET,
          signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN },
        };
      },
    }),
  ],
  providers: [JwtCookieService],
  exports: [JwtModule, JwtCookieService],
})
export class JwtCookieModule {}
