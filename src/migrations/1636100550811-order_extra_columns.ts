import { MigrationInterface, QueryRunner } from 'typeorm';

export class orderExtraColumns1636100550811 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ac_order
          ADD COLUMN order_number serial;`,
    );

    await queryRunner.query(`
        ALTER TABLE ac_order
            ADD COLUMN status ac_order_status NOT NULL DEFAULT 'new';
    `);

    await queryRunner.query(`
        ALTER TABLE ac_order
            ADD COLUMN is_downloaded bool NOT NULL DEFAULT FALSE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE ac_imported_order
            DROP COLUMN IF EXISTS order_number;
    `);
    await queryRunner.query(`
        ALTER TABLE ac_imported_order
            DROP COLUMN IF EXISTS status;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_imported_order
            DROP COLUMN IF EXISTS is_downloaded;
    `);
  }
}
