import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportDataController } from './import-data.controller';
import { ImportDataService } from './import-data.service';
import { XmlModule } from '../xml/xml.module';

@Module({
  imports: [TypeOrmModule.forFeature(), XmlModule],
  controllers: [ImportDataController],
  providers: [ImportDataService],
})
export class ImportDataModule {}
