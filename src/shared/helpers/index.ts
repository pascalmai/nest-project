import { BadRequestException } from '@nestjs/common';
import crypto from 'crypto';

export class ArticleUploadHelper {
  static customFileName(req, file, cb) {
    cb(null, 'article_' + crypto.randomBytes(8).toString('hex') + '.xlsx');
  }

  static destinationPath(req, file, cb) {
    cb(null, './dist/assets/files/');
  }

  static filterFile(req: Request, file, cb) {
    if (
      file.mimetype !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return cb(new BadRequestException('Extension not allowed'));
    }
    return cb(null, true);
  }
}
