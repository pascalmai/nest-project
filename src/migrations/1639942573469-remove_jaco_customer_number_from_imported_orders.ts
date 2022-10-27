import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeJacoCustomerNumberFromImportedOrders1639942573469
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ac_imported_order 
            DROP COLUMN jako_customer_number
        `);

    // next line adds not-null constraint to new column. this will fail if we don't delete
    await queryRunner.query(`
      DELETE FROM ac_imported_order
    `);

    await queryRunner.query(`
            ALTER TABLE ac_imported_order
            ADD COLUMN sportclub_id UUID NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ac_imported_order
            ADD COLUMN jako_customer_number VARCHAR(64) NOT NULL
        `);

    await queryRunner.query(`
            ALTER TABLE ac_imported_order
            DROP COLUMN sportclub_id
    `);
  }
}
