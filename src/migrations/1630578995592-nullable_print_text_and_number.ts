import { MigrationInterface, QueryRunner } from 'typeorm';

export class nullablePrintTextAndNumber1630578995592
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ac_order_line ALTER COLUMN print_number DROP NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE ac_order_line ALTER COLUMN print_text DROP NOT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ac_order_line ALTER COLUMN print_number SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE ac_order_line ALTER COLUMN print_text SET NOT NULL;`,
    );
  }
}
