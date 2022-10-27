import { MigrationInterface, QueryRunner } from 'typeorm';

export class archivingTeamMemberCollection1632991011692
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await archivingTeamMemberCollection1632991011692.addSportclubIdToMember(
      queryRunner,
    );

    await archivingTeamMemberCollection1632991011692.addDeletedColumns(
      queryRunner,
      'ac_member',
    );
    await archivingTeamMemberCollection1632991011692.addDeletedColumns(
      queryRunner,
      'ac_collection',
    );
    await archivingTeamMemberCollection1632991011692.addDeletedColumns(
      queryRunner,
      'ac_team',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE ac_member
            DROP CONSTRAINT IF EXISTS fk_member_sportclub;
    `);

    await queryRunner.query(
      `ALTER TABLE ac_member
          DROP COLUMN IF EXISTS sportclub_id;`,
    );

    await archivingTeamMemberCollection1632991011692.rollbackDeletedColumns(
      queryRunner,
      'ac_member',
    );
    await archivingTeamMemberCollection1632991011692.rollbackDeletedColumns(
      queryRunner,
      'ac_collection',
    );
    await archivingTeamMemberCollection1632991011692.rollbackDeletedColumns(
      queryRunner,
      'ac_team',
    );
  }

  private static async addSportclubIdToMember(queryRunner: QueryRunner) {
    await queryRunner.query(`
        ALTER TABLE ac_member
            ADD COLUMN sportclub_id uuid;
    `);

    const { id } = (
      await queryRunner.query(
        `SELECT id
         from ac_sportclub
         where "name" = 'FIFA';`,
      )
    )[0];

    await queryRunner.query(`
        UPDATE ac_member
        SET sportclub_id='${id}'
        WHERE sportclub_id is NULL;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_member
            ALTER COLUMN sportclub_id SET NOT NULL;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_member
            ADD CONSTRAINT fk_member_sportclub FOREIGN KEY (sportclub_id) REFERENCES ac_sportclub (id);
    `);
  }

  private static async addDeletedColumns(
    queryRunner: QueryRunner,
    tableName: string,
  ) {
    await queryRunner.query(`
        ALTER TABLE ${tableName}
            ADD COLUMN is_deleted boolean NOT NULL DEFAULT FALSE;
    `);

    await queryRunner.query(`
        ALTER TABLE ${tableName}
            ADD COLUMN deleted_at TIMESTAMPTZ;
    `);
  }

  private static async rollbackDeletedColumns(
    queryRunner: QueryRunner,
    tableName: string,
  ) {
    await queryRunner.query(`
        ALTER TABLE ${tableName}
            DROP COLUMN IF EXISTS is_deleted;
    `);

    await queryRunner.query(`
        ALTER TABLE ${tableName}
            DROP COLUMN IF EXISTS deleted_at;
    `);
  }
}
