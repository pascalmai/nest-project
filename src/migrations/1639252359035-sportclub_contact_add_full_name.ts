import { MigrationInterface, QueryRunner } from 'typeorm';

export class sportclubContactAddFullName1639252359035
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ac_sportclub_contact
            ADD COLUMN full_name varchar(128)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ac_sportclub_contact
            DROP COLUMN full_name
        `);
  }
}
