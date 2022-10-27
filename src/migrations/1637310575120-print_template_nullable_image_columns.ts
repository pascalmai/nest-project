import { MigrationInterface, QueryRunner } from 'typeorm';

export class printTemplateNullableImageColumns1637310575120
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ac_print_template ALTER COLUMN image_name DROP NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE ac_print_template ALTER COLUMN image_slot DROP NOT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ac_print_template ALTER COLUMN image_name SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE ac_print_template ALTER COLUMN image_slot SET NOT NULL;`,
    );
  }
}
