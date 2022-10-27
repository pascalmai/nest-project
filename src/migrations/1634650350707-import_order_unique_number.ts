import { MigrationInterface, QueryRunner } from 'typeorm';

export class importOrderUniqueNumber1634650350707
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ac_imported_order
          ADD COLUMN order_number VARCHAR(64) UNIQUE`,
    );
    await queryRunner.query(`UPDATE ac_imported_order
                             SET order_number="number"`);
    await queryRunner.query(`ALTER TABLE ac_imported_order
        DROP COLUMN IF EXISTS "number"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ac_imported_order
          ADD COLUMN IF NOT EXISTS number VARCHAR(64) UNIQUE`,
    );
    await queryRunner.query(`UPDATE ac_imported_order
                             SET "number"=order_number`);
    await queryRunner.query(`ALTER TABLE ac_imported_order
        DROP COLUMN IF EXISTS order_number`);
  }
}
