import { MigrationInterface, QueryRunner } from 'typeorm';

export class addArticleType1645108943536 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ac_article
            ADD COLUMN article_type VARCHAR(256) NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ac_article
            DROP COLUMN article_type
      `);
  }
}
