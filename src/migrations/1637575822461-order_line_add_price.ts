import { MigrationInterface, QueryRunner } from 'typeorm';

export class orderLineAddPrice1637575822461 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ac_order_line ADD COLUMN price NUMERIC(6, 2) DEFAULT 0;`,
    );
    await queryRunner.query(
      `ALTER TABLE ac_imported_order_line ADD COLUMN price NUMERIC(6, 2) DEFAULT 0;`,
    );

    // update price for existing orders
    await queryRunner.query(`
      with g as (
        select
            aag.price,
            aol.id
        from
            ac_order_line aol
        left join ac_article_size aas on
            aas.id = aol.article_size_id
        left join ac_article_gender aag on
            aag.id = aas.gender_id
        )
        update
            ac_order_line
        set
            price = g.price
        from
            g
        where
            ac_order_line.article_size_id is not null and g.id = ac_order_line.id    
    `);

    await queryRunner.query(`
        with g as (
            select
                aag.price,
                aiol.id
            from
                ac_imported_order_line aiol
            left join ac_article_size aas on
                aas.id = aiol.article_size_id
            left join ac_article_gender aag on
                aag.id = aas.gender_id
          )
        update
            ac_imported_order_line
        set
            price = g.price
        from
            g
        where
            ac_imported_order_line.article_size_id is not null and g.id = ac_imported_order_line.id;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ac_order_line DROP COLUMN price;`);
    await queryRunner.query(
      `ALTER TABLE ac_imported_order_line DROP COLUMN price;`,
    );
  }
}
