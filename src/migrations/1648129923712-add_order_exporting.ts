import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOrderExporting1648129923712 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE     ac_imported_order
        ADD COLUMN      is_ready_for_export bool default FALSE 
    `);
    await queryRunner.query(`
        ALTER TABLE     ac_imported_order
        ADD COLUMN      is_exported bool default FALSE 
    `);
    await queryRunner.query(`
        ALTER TABLE     ac_imported_order
        ADD COLUMN      exported_timestamp TIMESTAMP default NULL 
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_order
        ADD COLUMN      is_ready_for_export bool default FALSE 
    `);
    await queryRunner.query(`
        ALTER TABLE     ac_order
        ADD COLUMN      is_exported bool default FALSE 
    `);
    await queryRunner.query(`
        ALTER TABLE     ac_order
        ADD COLUMN      exported_timestamp TIMESTAMP default NULL 
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE     ac_imported_order
        DROP COLUMN IF EXISTS is_ready_for_export
    `);
    await queryRunner.query(`
        ALTER TABLE     ac_imported_order
        DROP COLUMN IF EXISTS is_exported
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_imported_order
        DROP COLUMN IF EXISTS exported_timestamp
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_order
        DROP COLUMN IF EXISTS is_ready_for_export
    `);
    await queryRunner.query(`
        ALTER TABLE     ac_order
        DROP COLUMN IF EXISTS is_exported
    `);
    await queryRunner.query(`
        ALTER TABLE     ac_order
        DROP COLUMN IF EXISTS exported_timestamp
    `);
  }
}
