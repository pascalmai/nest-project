import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSportclubIdToOrders1643646875186 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ac_order
            ADD COLUMN sportclub_id UUID;
        `);

    await queryRunner.query(`
            ALTER TABLE ac_order
            ADD CONSTRAINT fk_collection_team_sportclub FOREIGN KEY (sportclub_id) REFERENCES ac_sportclub (id);
        `);

    await queryRunner.query(`
            WITH g AS (
                SELECT
                    t.sportclub_id,
                    c.id collection_id
                FROM
                    ac_team t
                LEFT JOIN ac_collection c ON
                    c.team_id = t.id
            )
            UPDATE
                ac_order
            SET
                sportclub_id = g.sportclub_id
            FROM
                g
            WHERE
                ac_order.sportclub_id IS NULL AND g.collection_id = ac_order.collection_id
      `);

    await queryRunner.query(`
            ALTER TABLE ac_order
            ALTER COLUMN sportclub_id SET NOT NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE ac_order
            DROP COLUMN sportclub_id;
        `);
  }
}
