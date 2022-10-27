import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOrderStatusType1666336813686 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE ac_order_status ADD VALUE 'paid';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
