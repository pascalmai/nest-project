import { MigrationInterface, QueryRunner } from 'typeorm';

export class importedOrders1632125044256 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE ac_imported_order
        (
            id                   uuid        NOT NULL DEFAULT uuid_generate_v4(),
            jako_customer_number VARCHAR(64) NOT NULL,
            created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (id)
        );
    `);

    await queryRunner.query(`
        CREATE TABLE ac_imported_order_line
        (
            id              uuid        NOT NULL DEFAULT uuid_generate_v4(),
            order_id        uuid        NOT NULL,
            article_id      uuid,
            article_size_id uuid,
            amount          SMALLINT    NOT NULL DEFAULT 0,
            print_number    VARCHAR(64),
            print_text      VARCHAR(64),
            image_url       VARCHAR(512),
            image_view      VARCHAR(64),
            font_family     VARCHAR(64),
            font_color      VARCHAR(64),
            text_view       VARCHAR(64),
            created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (id),
            FOREIGN KEY (order_id) REFERENCES ac_imported_order (id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (article_id) REFERENCES ac_article (id) ON UPDATE CASCADE ON DELETE CASCADE,
            FOREIGN KEY (article_size_id) REFERENCES ac_article_size (id) ON UPDATE CASCADE ON DELETE CASCADE
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ac_imported_order`);
    await queryRunner.query(`DROP TABLE IF EXISTS ac_imported_order_line`);
  }
}
