import { MigrationInterface, QueryRunner } from 'typeorm';

export class addImageFieldIoTemplate1653391148536
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE     ac_imported_order_line_print_template
        ADD COLUMN      image_field VARCHAR(64) NULL 
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE     ac_imported_order_line_print_template
        DROP COLUMN IF EXISTS image_field
    `);
  }
}
