import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeDuplicatedOrderLines1666172423873
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM ac_imported_order_line
            WHERE id IN (
              SELECT id FROM (
                SELECT id,
                ROW_NUMBER() OVER( PARTITION BY order_id, article_id, article_size_id
                ORDER BY id
              ) AS row_num
              FROM ac_imported_order_line
            ) t
            WHERE t.row_num > 1 AND t.id = ac_imported_order_line.id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
