import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportclubContactRepository } from './repositories/sportclub-contact.repository';
import { SportclubRepository } from './repositories/sportclub.repository';
import { SportclubController } from './controllers/sportclub.controller';
import { SportclubService } from './services/sportclub.service';
import { SportclubContactService } from './services/sportclub-contact.service';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { AddressModule } from '../address/address.module';
import { CustomerController } from './controllers/customer.controller';
import { CustomerService } from './services/customer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SportclubRepository, SportclubContactRepository]),
    FileUploadModule,
    AddressModule,
  ],
  controllers: [SportclubController, CustomerController],
  providers: [SportclubService, SportclubContactService, CustomerService],
  exports: [SportclubService],
})
export class SportclubModule {}
