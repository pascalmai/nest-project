import { Module } from '@nestjs/common';
import { GenerateXmlService } from './generate-xml.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportXmlService } from './import-xml.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature(), EmailModule],
  providers: [GenerateXmlService, ImportXmlService],
  exports: [GenerateXmlService, ImportXmlService],
})
export class XmlModule {}
