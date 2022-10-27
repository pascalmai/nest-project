import { MulterModule } from '@nestjs/platform-express';
import mime from 'mime-types';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { uploadFilesPath } from '../../shared/constants';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
      storage: diskStorage({
        destination(_req, _file, cb) {
          cb(null, uploadFilesPath);
        },
        filename(_req, file, cb) {
          const ext = mime.extension(file.mimetype);
          cb(
            null,
            crypto.randomBytes(8).toString('hex') +
              '-' +
              Date.now() +
              '.' +
              ext,
          );
        },
      }),
    }),
  ],
  exports: [MulterModule],
})
export class FileUploadModule {}
