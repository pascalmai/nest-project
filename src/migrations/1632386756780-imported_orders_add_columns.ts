import { MigrationInterface, QueryRunner } from 'typeorm';

export class importedOrdersAddColumns1632386756780
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE ac_order_status as ENUM ('new', 'in_progress', 'invalid_data', 'done', 'shipping_ready', 'sent');
      `);

    await queryRunner.query(`
        ALTER TABLE ac_imported_order
            ADD COLUMN status ac_order_status NOT NULL DEFAULT 'new';
    `);

    await queryRunner.query(`
        ALTER TABLE ac_imported_order
            ADD COLUMN number VARCHAR(64);
    `);

    await queryRunner.query(`
        ALTER TABLE ac_imported_order
            ADD COLUMN is_downloaded bool NOT NULL DEFAULT FALSE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TYPE IF EXISTS order_status;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_imported_order
            DROP COLUMN IF EXISTS status;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_imported_order
            DROP COLUMN IF EXISTS number;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_imported_order
            DROP COLUMN IF EXISTS is_downloaded;
    `);
  }
}
