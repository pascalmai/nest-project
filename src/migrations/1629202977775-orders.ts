import { MigrationInterface, QueryRunner } from 'typeorm';

export class orders1629202977775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE ac_order
      (
        id               uuid NOT NULL DEFAULT uuid_generate_v4(),
        collection_id    uuid NOT NULL,
        created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (id),
        FOREIGN KEY (collection_id) REFERENCES ac_collection(id) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE ac_order_line
      (
        id                uuid NOT NULL DEFAULT uuid_generate_v4(),
        order_id          uuid NOT NULL,
        article_id        uuid NOT NULL,
        article_size_id   uuid NOT NULL,
        member_id         uuid NOT NULL,
        amount            SMALLINT NOT NULL,
        print_number      VARCHAR(64) NOT NULL,
        print_text        VARCHAR(64) NOT NULL,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (id),
        FOREIGN KEY (order_id) REFERENCES ac_order(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES ac_article(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (article_size_id) REFERENCES ac_article_size(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES ac_member(id) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ac_order;`);
    await queryRunner.query(`DROP TABLE IF EXISTS ac_order_line;`);
  }
}
