import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAddressZipcodeSize1660858666875 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE     ac_address
            ALTER COLUMN postal_code TYPE VARCHAR(64);
        `);

    await queryRunner.query(`
        ALTER TABLE     ac_address
        ALTER COLUMN postal_code DROP NOT NULL
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_address
        ALTER COLUMN house_number TYPE VARCHAR(64);
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_address
        ALTER COLUMN house_number DROP NOT NULL
        `);

    await queryRunner.query(`
        ALTER TABLE     ac_address
        ALTER COLUMN street TYPE VARCHAR(64);
    `);

    await queryRunner.query(`
        ALTER TABLE     ac_address
        ALTER COLUMN street DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE     ac_address
            ALTER COLUMN postal_code TYPE VARCHAR(10);
        `);
    await queryRunner.query(`
            ALTER TABLE     ac_address
            ALTER COLUMN postal_code SET NOT NULL;
        `);
    await queryRunner.query(`
        ALTER TABLE     ac_address
        ALTER COLUMN house_number TYPE VARCHAR(10);
    `);
    await queryRunner.query(`
        ALTER TABLE     ac_address
        ALTER COLUMN house_number SET NOT NULL;
    `);
    await queryRunner.query(`
        ALTER TABLE     ac_address
        ALTER COLUMN street TYPE VARCHAR(10);
    `);
    await queryRunner.query(`
        ALTER TABLE     ac_address
        ALTER COLUMN street SET NOT NULL;
    `);
  }
}
