import { EntityRepository, Repository } from 'typeorm';
import { ArticleEntity } from '../entities/article.entity';

@EntityRepository(ArticleEntity)
export class ArticleRepository extends Repository<ArticleEntity> {
  findColorCodes(articleIds: string[]) {
    const ids = articleIds.map((id) => `'${id}'`).join(', ');

    return this.query(`
      select
        aa.id as "id",
        aa.jako_id as "jakoId",
        aa.jako_color_code as "jakoColorCode",
        aa.jako_color_description as "jakoColorDescription"
      from
        ac_article aa
      where
        aa.jako_id in (
        select
          aa.jako_id
        from
          ac_article aa
        where
          aa.id in (${ids})
        group by
          aa.jako_id)
      order by
        aa.jako_id,
        aa.jako_color_code;
    `);
  }
}
