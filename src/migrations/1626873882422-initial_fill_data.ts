import { MigrationInterface, QueryRunner } from 'typeorm';

export class initialFillData1626873882422 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO ac_user (email, password, is_admin)
      VALUES (
          'admin@example.com',
          '$2b$10$6Bu.EaCYd3t9YgD6VV7epeuhXPqkXQ6PcrRZsrrSpXUXTUKsnz1km',
          TRUE
      );
    `);

    const [admin] = await queryRunner.query(
      `SELECT id, email FROM ac_user where email='admin@example.com'; `,
    );

    await queryRunner.query(`
      INSERT INTO ac_sportclub (owner_id, name)
      VALUES (
          '${admin.id}',
          'FIFA'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
