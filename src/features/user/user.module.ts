import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportclubModule } from '../sportclub/sportclub.module';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), SportclubModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
