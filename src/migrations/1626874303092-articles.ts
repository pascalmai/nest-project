import { MigrationInterface, QueryRunner } from 'typeorm';

export class articles1626874303092 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE ac_jako_size (
        id    uuid NOT NULL DEFAULT uuid_generate_v4(),
        jako_size_id VARCHAR(64) NOT NULL,
        name  VARCHAR(64) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE (jako_size_id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE ac_category (
        id              uuid NOT NULL DEFAULT uuid_generate_v4(),
        ident           VARCHAR(64) NOT NULL UNIQUE,
        PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE ac_jako_category
      (
        id               uuid NOT NULL DEFAULT uuid_generate_v4(),
        jako_category_id VARCHAR(64) NOT NULL UNIQUE,
        category_id      uuid NOT NULL,
        name             VARCHAR(64) NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (category_id) REFERENCES ac_category(id) ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX ac_jako_category_id_name_uindex on ac_jako_category (jako_category_id, name);
    `);

    await queryRunner.query(`
      CREATE TABLE ac_article
      (
        id               uuid NOT NULL DEFAULT uuid_generate_v4(),
        jako_id          VARCHAR(64)  NOT NULL,
        name             VARCHAR(128) NOT NULL,
        jako_color_code  VARCHAR(64),
        jako_category_id VARCHAR(64)  NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (jako_category_id) REFERENCES ac_jako_category(jako_category_id) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX ac_article_jako_id_jako_color_code_uindex ON ac_article (jako_id, jako_color_code);
    `);

    await queryRunner.query(`
      CREATE TYPE ac_gender_enum AS ENUM ('Kids', 'Men', 'Women', 'Unisex');
    `);

    await queryRunner.query(`
      CREATE TABLE ac_article_gender
      (
        id               uuid NOT NULL DEFAULT uuid_generate_v4(),
        article_id       uuid NOT NULL,
        gender           ac_gender_enum,
        cdn_image_name   VARCHAR(64) NOT NULL,
        purchase_price   NUMERIC(6, 2) NOT NULL,
        price            NUMERIC(6, 2) NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (article_id) REFERENCES ac_article(id) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX ac_article_gender_article_id_gender_uindex ON ac_article_gender (article_id, gender);
    `);

    await queryRunner.query(`
      CREATE TABLE ac_article_size
      (
        id               uuid NOT NULL DEFAULT uuid_generate_v4(),
        gender_id        uuid NOT NULL,
        jako_size_id     VARCHAR(64) NOT NULL,
        ean              VARCHAR(64) NOT NULL,
        available_from   DATE NOT NULL,
        available_to     DATE NOT NULL,
        weight_in_kg     NUMERIC(6,3) NOT NULL,
        volume_in_liter  NUMERIC(5,2) DEFAULT 0 NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (gender_id) REFERENCES ac_article_gender(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (jako_size_id) REFERENCES ac_jako_size(jako_size_id) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX ac_article_size_ean_uindex on ac_article_size (ean);
    `);

    await queryRunner.query(`
      INSERT INTO ac_category(ident)
      VALUES ('top'), ('bottom'), ('tracksuit'), ('shoe');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE ac_article, ac_jako_size, ac_category, ac_jako_category, ac_article_gender, ac_article_size;`,
    );
    await queryRunner.query(`DROP TYPE ac_gender_enum;`);
  }
}
