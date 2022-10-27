import { MigrationInterface, QueryRunner } from 'typeorm';

export class collections1626935046527 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE ac_collection (
        id               uuid NOT NULL DEFAULT uuid_generate_v4(),
        name             VARCHAR(64),
        team_id          uuid NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (team_id) REFERENCES ac_team(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      ALTER TABLE ac_team ADD COLUMN standard_collection_id uuid UNIQUE;
    `);

    await queryRunner.query(`
      ALTER TABLE ac_team 
      ADD CONSTRAINT team_standard_collection_fk
      FOREIGN KEY (standard_collection_id)
      REFERENCES ac_collection(id)
      ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      CREATE TABLE ac_collection_article (
        id                uuid NOT NULL DEFAULT uuid_generate_v4(),
        collection_id     uuid NOT NULL,
        article_id        uuid NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (collection_id) REFERENCES ac_collection(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES ac_article(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE teams DROP CONSTRAINT IF EXISTS team_standard_collection_fk;
    `);
    await queryRunner.query(
      `ALTER TABLE teams DROP COLUMN IF EXISTS standard_collection_id;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS ac_collection;`);
    await queryRunner.query(`DROP TABLE IF EXISTS ac_collection_article;`);
  }
}
