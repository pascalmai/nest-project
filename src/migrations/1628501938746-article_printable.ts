import { MigrationInterface, QueryRunner } from 'typeorm';

export class articlePrintable1628501938746 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ac_article ADD COLUMN is_printable BOOLEAN DEFAULT TRUE;
    `);

    await queryRunner.query(`
      UPDATE
        ac_article aa
      SET
        is_printable = FALSE
      FROM ac_jako_category ajc
      LEFT JOIN ac_category ac on
        ac.id = ajc.category_id
      WHERE
        ajc.jako_category_id = aa.jako_category_id and
        ac.ident = 'shoe';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ac_article DROP COLUMN is_printable;
    `);
  }
}
