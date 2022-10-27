import { MigrationInterface, QueryRunner } from 'typeorm';

export class createNotes1661787629003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE ac_note (
                id                      uuid NOT NULL DEFAULT uuid_generate_v4(),
                order_id                uuid NULL,
                imported_order_id       uuid NULL,
                type                    VARCHAR(64) NOT NULL,
                content                 VARCHAR(256) NULL,
                created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (id),
                FOREIGN KEY (order_id) REFERENCES ac_order (id) ON UPDATE CASCADE ON DELETE SET NULL,
                FOREIGN KEY (imported_order_id) REFERENCES ac_imported_order (id) ON UPDATE CASCADE ON DELETE SET NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ac_note`);
  }
}
