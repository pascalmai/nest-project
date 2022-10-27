import { MigrationInterface, QueryRunner } from 'typeorm';

export class printTemplates1628506176684 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE ac_print_template
      (
        id               uuid NOT NULL DEFAULT uuid_generate_v4(),
        font             VARCHAR(64)  NOT NULL,
        image_name       VARCHAR(64) NOT NULL,
        image_slot       VARCHAR(64) NOT NULL,
        collection_id    uuid NOT NULL,
        article_id       uuid NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (article_id) REFERENCES ac_article(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (collection_id) REFERENCES ac_collection(id) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE ac_article_template_slot
      (
        id               uuid NOT NULL DEFAULT uuid_generate_v4(),
        name             VARCHAR(64) NOT NULL,
        article_id       uuid NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (article_id) REFERENCES ac_article(id) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ac_print_template`);
    await queryRunner.query(`DROP TABLE IF EXISTS ac_article_template_slot`);
  }
}
