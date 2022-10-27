import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1626860757047 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create extension if not exists "uuid-ossp";`);

    // users table
    await queryRunner.query(`
      CREATE TABLE ac_user (
        id              uuid NOT NULL DEFAULT uuid_generate_v4(),
        email           VARCHAR(64) NOT NULL UNIQUE,
        name            VARCHAR(64),
        password        VARCHAR(64) NOT NULL,
        is_admin        BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY (id)
      );
    `);

    // sportclubs
    await queryRunner.query(`
      CREATE TABLE ac_sportclub (
        id                  uuid NOT NULL DEFAULT uuid_generate_v4(),
        owner_id            uuid NOT NULL,
        name                VARCHAR(64),
        invoice_address     VARCHAR(64),
        delivery_address    VARCHAR(64),
        notes               TEXT,
        PRIMARY KEY (id),
        FOREIGN KEY (owner_id) REFERENCES ac_user(id) ON DELETE CASCADE
      );
    `);

    // teams
    await queryRunner.query(`
      CREATE TABLE ac_team (
        id              uuid NOT NULL DEFAULT uuid_generate_v4(),
        sportclub_id    uuid,
        name            VARCHAR(64),
        description     VARCHAR(64),
        PRIMARY KEY (id),
        CONSTRAINT fk_team_sportclub FOREIGN KEY(sportclub_id) REFERENCES ac_sportclub(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // sportclub contacts
    await queryRunner.query(`
      CREATE TABLE ac_sportclub_contact (
        id                  uuid NOT NULL DEFAULT uuid_generate_v4(),
        sportclub_id        uuid NOT NULL,
        phone               VARCHAR(64),
        email               VARCHAR(64),
        photo               VARCHAR(64),
        PRIMARY KEY (id),
        FOREIGN KEY (sportclub_id) REFERENCES ac_sportclub(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table ac_sportclub_contact;`);
    await queryRunner.query(`drop table ac_team;`);
    await queryRunner.query(`drop table ac_sportclub;`);
    await queryRunner.query(`drop table ac_user;`);
    await queryRunner.query(`drop extension "uuid-ossp";`);
  }
}
