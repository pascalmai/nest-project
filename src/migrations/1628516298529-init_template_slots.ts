import { MigrationInterface, QueryRunner } from 'typeorm';
import { ImageSlot } from '../shared/enums';

export class initTemplateSlots1628516298529 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const articleIds = await queryRunner.query(`
      select
        aa.id
      from
        ac_article aa 
      where aa.is_printable = TRUE
    `);

    if (!articleIds || !articleIds.length) {
      return;
    }

    let insertSQL = `INSERT INTO ac_article_template_slot (article_id, "name") VALUES `;

    for (let i = 0; i < articleIds.length; i++) {
      const { id } = articleIds[i] || {};

      if (!id) {
        continue;
      }

      insertSQL += `${getInsertValuesForArticle(id)}`;

      if (i !== articleIds.length - 1) {
        insertSQL += `, `;
      } else {
        insertSQL += `;`;
      }
    }

    await queryRunner.query(insertSQL);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM ac_article_template_slot;`);
  }
}

const getInsertValuesForArticle = (articleId: string): string => {
  const slotNames = [
    ImageSlot.FRONT_MAIN,
    ImageSlot.FRONT_ADDITIONAL,
    ImageSlot.BACK_MAIN,
    ImageSlot.BACK_ADDITIONAL,
    ImageSlot.SIDE_LEFT,
    ImageSlot.SIDE_RIGHT,
  ];

  return slotNames.map((name) => `('${articleId}', '${name}')`).join(', ');
};
