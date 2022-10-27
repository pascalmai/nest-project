import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeSomeContraints1660838995198 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE     ac_article
        ALTER COLUMN jako_category_id DROP NOT NULL
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_article_size
        DROP CONSTRAINT IF EXISTS ac_article_size_gender_id_fkey
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_article_size
        DROP CONSTRAINT IF EXISTS ac_article_size_jako_size_id_fkey
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_article
        DROP CONSTRAINT IF EXISTS ac_article_jako_category_id_fkey
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_article_size
        ALTER COLUMN gender_id DROP NOT NULL,
        ALTER COLUMN jako_size_id DROP NOT NULL
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_jako_category
        ALTER COLUMN category_id DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE     ac_article
        ALTER COLUMN jako_category_id NOT NULL
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_article_size
            ALTER COLUMN gender_id NOT NULL,
            ALTER COLUMN jako_size_id NOT NULL
        `);

    await queryRunner.query(`
        ALTER TABLE     ac_jako_category
        ALTER COLUMN category_id NOT NULL
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_article_size
        ADD CONSTRAINT ac_article_size_gender_id_fkey FOREIGN KEY (gender_id) REFERENCES ac_article_gender (id);
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_article_size
        ADD CONSTRAINT ac_article_size_jako_size_id_fkey FOREIGN KEY (jako_size_id) REFERENCES ac_jako_size (id);
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_article
        ADD CONSTRAINT ac_article_jako_category_id_fkey FOREIGN KEY (jako_category_id) REFERENCES ac_jako_category (id);

        DROP CONSTRAINT IF EXISTS ac_article_jako_category_id_fkey
    `);
  }
}
