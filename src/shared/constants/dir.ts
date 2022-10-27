import path from 'path';

export const uploadFilesPath = path.join(__dirname, '../../../', 'uploads');
export const IO_UNPROCESSED_DIR = path.resolve(
  __dirname,
  `../../../order_import/unprocessed`,
);
export const IO_PROCESSED_DIR = path.resolve(
  __dirname,
  `../../../order_import/processed`,
);
export const IO_ERROR_DIR = path.resolve(
  __dirname,
  `../../../order_import/error`,
);

export const LOCAL_EXPORTED_IO_DIR = path.join(__dirname, '../../assets/xml');

export const FTP_SERVER_BASE_DIR = '_KUNDE/19440';
