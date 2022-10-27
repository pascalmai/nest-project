import { MigrationInterface, QueryRunner } from 'typeorm';

export class members1626933930427 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE ac_member (
        id                      uuid NOT NULL DEFAULT uuid_generate_v4(),
        name                    VARCHAR(64),
        gender                  VARCHAR(64),
        dob                     DATE default NULL,
        height                  SMALLINT,
        jersey_number           SMALLINT,
        jersey_text             VARCHAR(64),
        created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE ac_member_size (
        id            uuid NOT NULL DEFAULT uuid_generate_v4(),
        member_id     uuid NOT NULL,
        category_id   uuid NOT NULL,
        jako_size_id  VARCHAR(64) NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (member_id) REFERENCES ac_member(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES ac_category(id) ON DELETE CASCADE,
        FOREIGN KEY (jako_size_id) REFERENCES ac_jako_size(jako_size_id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX ac_member_size_member_id_category_id_uindex ON ac_member_size (member_id, category_id);
    `);

    await queryRunner.query(`
      CREATE TABLE ac_member_team(
        id            uuid NOT NULL DEFAULT uuid_generate_v4(),
        member_id     uuid NOT NULL,
        team_id       uuid NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (member_id) REFERENCES ac_member(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES ac_team(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      INSERT INTO ac_member (name, gender, dob, height, jersey_number, jersey_text)
      VALUES (
        'Member male',
        'male',
        '12-12-1993',
        182,
        25,
        'Jersey text'
      ),
      (
        'Member female',
        'female',
        '12-12-1993',
        167,
        26,
        'Jersey text'
      ),
      (
        'Member child',
        'child',
        '12-12-2012',
        145,
        27,
        'Jersey text'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE ac_member_team;`);
    await queryRunner.query(`DROP TABLE ac_member_size;`);
    await queryRunner.query(`DROP TABLE ac_member;`);
  }
}
