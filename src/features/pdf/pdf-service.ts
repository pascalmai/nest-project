import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import pdfmakerVfsFont from 'pdfmake/build/vfs_fonts';

@Injectable()
export class PdfService {
  private fonts = {
    Roboto: {
      normal: Buffer.from(
        pdfmakerVfsFont.pdfMake.vfs['Roboto-Regular.ttf'],
        'base64',
      ),
      bold: Buffer.from(
        pdfmakerVfsFont.pdfMake.vfs['Roboto-Medium.ttf'],
        'base64',
      ),
      italics: Buffer.from(
        pdfmakerVfsFont.pdfMake.vfs['Roboto-Italic.ttf'],
        'base64',
      ),
      bolditalics: Buffer.from(
        pdfmakerVfsFont.pdfMake.vfs['Roboto-MediumItalic.ttf'],
        'base64',
      ),
    },
  };

  createPrinter(): PdfPrinter {
    return new PdfPrinter(this.fonts);
  }
}
