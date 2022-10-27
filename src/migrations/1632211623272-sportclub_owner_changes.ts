import { MigrationInterface, QueryRunner } from 'typeorm';

export class sportclubOwnerChanges1632211623272 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ac_sportclub ALTER COLUMN owner_id DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE ac_sportclub ADD COLUMN jako_customer_number VARCHAR(64);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ac_sportclub ALTER COLUMN owner_id SET NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE ac_sportclub DROP COLUMN IF EXISTS jako_customer_number;
    `);
  }
}
