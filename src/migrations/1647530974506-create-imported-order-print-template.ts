import { MigrationInterface, QueryRunner } from 'typeorm';

export class createImportedOrderPrintTemplate1647453605606
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE ac_imported_order_line_print_template (
                id                 uuid NOT NULL DEFAULT uuid_generate_v4(),
                order_line_id      uuid NOT NULL,
                image_url          VARCHAR(256) NOT NULL,
                image_view         VARCHAR(256) NOT NULL,
                PRIMARY KEY (id)
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS ac_imported_order_line_print_template`,
    );
  }
}
