import { MigrationInterface, QueryRunner } from 'typeorm';

export class importedOrderShippingAddress1632915981946
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ac_imported_order ADD COLUMN shipping_address_id uuid;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ac_imported_order DROP COLUMN IF EXISTS shipping_address_id;
    `);
  }
}
