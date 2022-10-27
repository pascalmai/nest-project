import { MigrationInterface, QueryRunner } from 'typeorm';

export class sportclubAddNumberAndDiscount1633697994550
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            ADD COLUMN customer_number serial;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            ADD COLUMN discount int default 0;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            ADD COLUMN is_deleted boolean NOT NULL DEFAULT FALSE;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            ADD COLUMN deleted_at TIMESTAMPTZ;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            DROP COLUMN IF EXISTS customer_number;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            DROP COLUMN IF EXISTS discount;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            DROP COLUMN IF EXISTS is_deleted;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            DROP COLUMN IF EXISTS deleted_at;
    `);
  }
}
