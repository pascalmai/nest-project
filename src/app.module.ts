import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ArticleModule } from './features/article/article.module';
import { AuthModule } from './features/auth/auth.module';
import { CategoryModule } from './features/category/category.module';
import { CollectionModule } from './features/collection/collection.module';
import { ImportDataModule } from './features/import-data/import-data.module';
import { JakoSizeModule } from './features/jako-size/jako-size.module';
import { JwtCookieModule } from './features/jwt-cookie/jwt-cookie.module';
import { MemberModule } from './features/member/member.module';
import { SizeModule } from './features/size/size.module';
import { SportclubModule } from './features/sportclub/sportclub.module';
import { TeamModule } from './features/team/team.module';
import { UserModule } from './features/user/user.module';
import { PrintTemplateModule } from './features/print-template/print-template.module';
import { OrderModule } from './features/order/order.module';
import { XmlModule } from './features/xml/xml.module';
import { ImportedOrderModule } from './features/imported-order/imported-order.module';
import { AddressModule } from './features/address/address.module';
import { PdfModule } from './features/pdf/pdf.module';
import { EmailModule } from './features/email/email.module';
import { AdditionalOrderModule } from './features/additional-order/additional-order.module';
import { FtpExportModule } from './features/ftp-export/ftp-export.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './features/cron/cron.module';
import { NoteModule } from './features/note/note.module';

const FEATURE_MODULES = [
  TeamModule,
  MemberModule,
  SportclubModule,
  UserModule,
  CategoryModule,
  CollectionModule,
  ArticleModule,
  JakoSizeModule,
  AuthModule,
  JwtCookieModule,
  ImportDataModule,
  SizeModule,
  PrintTemplateModule,
  OrderModule,
  ImportedOrderModule,
  AddressModule,
  AdditionalOrderModule,
  NoteModule,

  XmlModule,
  PdfModule,
  EmailModule,
  FtpExportModule,
  CronModule,
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/api',
    }),
    ...FEATURE_MODULES,
  ],
})
export class AppModule {}
