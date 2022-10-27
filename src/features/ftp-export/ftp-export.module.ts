import { Module } from '@nestjs/common';
import { FtpModule } from 'nestjs-ftp';
import { FtpExportService } from './ftp-export.service';

@Module({
  imports: [
    FtpModule.forRootFtpAsync({
      useFactory: async () => {
        return {
          host: process.env.FTP_HOST,
          password: process.env.FTP_PASSWORD,
          port: Number(process.env.FTP_PORT),
          user: process.env.FTP_USERNAME,
          secure: process.env.FTP_SECURED === 'true',
        };
      },
      inject: [],
    }),
  ],
  providers: [FtpExportService],
  exports: [FtpExportService],
})
export class FtpExportModule {}
