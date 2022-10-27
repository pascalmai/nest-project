import { MigrationInterface, QueryRunner } from 'typeorm';

export class additionalOrderLines1642238299442 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE ac_additional_order (
                id                      uuid NOT NULL DEFAULT uuid_generate_v4(),
                order_id                uuid NULL,
                imported_order_id       uuid NULL,
                name                    VARCHAR(64) NOT NULL,
                description             VARCHAR(256) NULL,
                amount                  SMALLINT NOT NULL,
                price                   NUMERIC(6, 2) NOT NULL,
                created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (id),
                FOREIGN KEY (order_id) REFERENCES ac_order (id) ON UPDATE CASCADE ON DELETE SET NULL,
                FOREIGN KEY (imported_order_id) REFERENCES ac_imported_order (id) ON UPDATE CASCADE ON DELETE SET NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ac_additional_order_line`);
  }
}
