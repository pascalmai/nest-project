import { Injectable } from '@nestjs/common';
import { FtpService } from 'nestjs-ftp';

@Injectable()
export class FtpExportService {
  constructor(private readonly _ftpService: FtpService) {}

  async uploadFile(
    sourceFilePath: string,
    fileNameOnServer: string,
  ): Promise<any> {
    try {
      return await this._ftpService.upload(sourceFilePath, fileNameOnServer);
    } catch (error) {
      throw new Error(error);
    }
  }
}
