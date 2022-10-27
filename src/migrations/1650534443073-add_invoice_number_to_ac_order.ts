import { MigrationInterface, QueryRunner } from 'typeorm';

export class addInvoiceNumberToAcOrder1650534443073
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE ac_imported_order
        ADD COLUMN invoice_number integer NOT NULL DEFAULT nextval('ac_order_order_number_seq'::regclass)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE ac_imported_order
        DROP COLUMN IF EXISTS invoice_number
    `);
  }
}
