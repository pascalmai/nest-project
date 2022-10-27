import { MigrationInterface, QueryRunner } from 'typeorm';

export class teams1626934833349 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [sportclub] = await queryRunner.query(
      `SELECT id FROM ac_sportclub where name='FIFA';`,
    );

    await queryRunner.query(`
      INSERT INTO ac_team (sportclub_id, name, description)
      VALUES (
        '${sportclub.id}',
        'Demo Team #1',
        'The first demo team of the demo sport club'
      ),
      (
        '${sportclub.id}',
        'Demo Team #2',
        'The second demo team of the demo sport club'
      ),
      (
        '${sportclub.id}',
        'Demo Team #3',
        'The third demo team of the demo sport club'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
