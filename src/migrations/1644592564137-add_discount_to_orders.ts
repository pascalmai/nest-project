import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDiscountToOrders1644592564137 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE     ac_order
            ADD COLUMN      discount int default NULL 
        `);

    await queryRunner.query(`
            ALTER TABLE     ac_imported_order
            ADD COLUMN      discount int default NULL 
        `);

    await queryRunner.query(`
          WITH acs AS (
            SELECT
                acss.id,
                acss.discount
            FROM
                ac_sportclub acss
          )
          UPDATE
            ac_order
          SET
            discount = acs.discount
          FROM
            acs
          WHERE
            ac_order.sportclub_id = acs.id
    `);

    await queryRunner.query(`
          WITH acs AS (
            SELECT
                acss.id,
                acss.discount
            FROM
                ac_sportclub acss
          )
          UPDATE
            ac_imported_order
          SET
            discount = acs.discount
          FROM
            acs
          WHERE
            ac_imported_order.sportclub_id = acs.id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE     ac_order
        DROP COLUMN     discount
      `);

    await queryRunner.query(`
        ALTER TABLE     ac_imported_order
        DROP COLUMN     discount
      `);
  }
}
