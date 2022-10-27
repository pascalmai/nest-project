import { MigrationInterface, QueryRunner } from 'typeorm';

export class articleColorDescription1630576501652
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ac_article ADD COLUMN jako_color_description VARCHAR(64);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE ac_team DROP COLUMN IF EXISTS jako_color_description;
    `);
  }
}
