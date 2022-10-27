import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTeamShopNameSportclub1653911631674
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ac_sportclub
            ADD COLUMN team_shop_name VARCHAR(64) NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ac_sportclub
            DROP COLUMN IF EXISTS team_shop_name
        `);
  }
}
