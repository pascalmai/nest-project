import { MigrationInterface, QueryRunner } from 'typeorm';

export class addressTable1631533085979 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE ac_address
        (
            id             uuid        NOT NULL DEFAULT uuid_generate_v4(),
            address_line_1 VARCHAR(64),
            address_line_2 VARCHAR(64),
            street         VARCHAR(64) NOT NULL,
            house_number   VARCHAR(10) NOT NULL,
            postal_code    VARCHAR(10) NOT NULL,
            city           VARCHAR(64) NOT NULL,
            PRIMARY KEY (id)
        );
    `);

    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            DROP COLUMN invoice_address,
            DROP COLUMN delivery_address;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            ADD COLUMN invoice_address_id uuid;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            ADD CONSTRAINT fk_sportclub_invoice_address FOREIGN KEY (invoice_address_id) REFERENCES ac_address (id);
    `);

    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            ADD COLUMN shipping_address_id uuid;
    `);

    await queryRunner.query(`
        ALTER TABLE ac_sportclub
            ADD CONSTRAINT fk_sportclub_shipping_address FOREIGN KEY (shipping_address_id) REFERENCES ac_address (id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS ac_address`);
    await queryRunner.query(`ALTER TABLE ac_sportclub
        DROP CONSTRAINT IF EXISTS fk_sportclub_invoice_address`);
    await queryRunner.query(`ALTER TABLE ac_sportclub
        DROP COLUMN IF EXISTS invoice_address_id`);
    await queryRunner.query(`ALTER TABLE ac_sportclub
        DROP CONSTRAINT IF EXISTS fk_sportclub_shipping_address`);
    await queryRunner.query(`ALTER TABLE ac_sportclub
        DROP COLUMN IF EXISTS shipping_address_id`);
    await queryRunner.query(`ALTER TABLE ac_sportclub
        ADD COLUMN IF NOT EXISTS invoice_address VARCHAR(64)`);
    await queryRunner.query(`ALTER TABLE ac_sportclub
        ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(64)`);
  }
}
