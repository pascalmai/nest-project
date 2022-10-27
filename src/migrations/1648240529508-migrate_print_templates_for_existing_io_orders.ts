import { MigrationInterface, QueryRunner } from 'typeorm';

export class migratePrintTemplatesForExistingIoOrders1648240529508
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        WITH acs AS (
            SELECT
                aciol.id,
                aciol.image_url,
                aciol.image_view
            FROM
                ac_imported_order_line aciol
            WHERE aciol.image_url IS NOT NULL AND aciol.image_view IS NOT NULL
        )
        INSERT INTO ac_imported_order_line_print_template (order_line_id, image_url, image_view)
        SELECT * FROM acs;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_imported_order_line
        DROP COLUMN image_url,
        DROP COLUMN image_view
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE ac_imported_order_line
        ADD COLUMN image_url VARCHAR(512) NULL,
        ADD COLUMN image_view VARCHAR(64) NULL
    `);
  }
}
