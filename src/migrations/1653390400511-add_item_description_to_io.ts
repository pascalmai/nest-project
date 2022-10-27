import { MigrationInterface, QueryRunner } from 'typeorm';

export class addItemDescriptionToIo1653390400511 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE     ac_imported_order_line
        ADD COLUMN      item_description VARCHAR(64) NULL 
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE     ac_imported_order_line
        DROP COLUMN IF EXISTS item_description
    `);
  }
}
