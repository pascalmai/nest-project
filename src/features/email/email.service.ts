import { Readable } from 'stream';
import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OkResponseDto } from 'src/shared/dto';
import isArray from 'lodash/isArray';
import isNil from 'lodash/isNil';

export interface EmailAttachment {
  filename: string;
  content: string | Buffer | Readable | PDFKit.PDFDocument | ArrayBuffer;
}

const DEFAULT_INVOICE_SUBJECT = 'Rechnung Teamsport Bodensee';
const DEFAULT_INVOICE_TEXT = `Sehr geehrter Kunde, die exportierte Rechnung ist beigefügt`;

@Injectable()
export class EmailService {
  private transport;

  constructor() {
    this.transport = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USERNAME,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }

  sendEmail(
    email: string,
    subject: string,
    text: string,
  ): Observable<OkResponseDto> {
    return this.sendEmailWithAttachment(email, null, subject, text);
  }

  sendEmailWithAttachment(
    emailData: string | string[],
    attachments: EmailAttachment | EmailAttachment[],
    subject = DEFAULT_INVOICE_SUBJECT,
    text = DEFAULT_INVOICE_TEXT,
  ): Observable<OkResponseDto> {
    const mailAttachments = isArray(attachments)
      ? attachments
      : isNil(attachments)
      ? null
      : [attachments];
    const mailOptions = {
      from: process.env.EMAIL_SERVER_VERIFIED_EMAIL,
      to: emailData,
      subject,
      text,
      attachments: mailAttachments,
    };
    return from(this.transport.sendMail(mailOptions)).pipe(
      map(() => ({ ok: true })),
    );
  }
}
