import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { Connection } from 'typeorm';
import { CATEGORY_IDENT } from '../../shared/enums';
import { SizeResponseDto, GetSizesQueryParamsDto } from './size.dto';

@Injectable()
export class SizeService {
  constructor(private readonly connection: Connection) {}

  getSizes(
    categoryIdent: CATEGORY_IDENT,
    { gender, children }: GetSizesQueryParamsDto,
  ): Observable<SizeResponseDto[]> {
    const genderArr = children === '1' ? ['Kids'] : ['Unisex'];

    if (gender) {
      genderArr.push(gender === 'female' ? 'Women' : 'Men');
    }

    return from(
      this.connection.query(
        `
          select
            sj.jako_size_id as "jakoSizeId",
            sj.name as "name"
          from
            ac_article
          join ac_article_gender ag on
            ac_article.id = ag.article_id
          join ac_article_size "as" on
            ag.id = "as".gender_id 
          join ac_jako_size sj on
            "as".jako_size_id = sj.jako_size_id 
          join ac_jako_category cj on
            cj.jako_category_id = ac_article.jako_category_id 
          join ac_category c on
            c.id = cj.category_id
          where
            c.ident = $1
            and ag.gender = any($2)
          group by sj.jako_size_id, sj.name 
        `,
        [categoryIdent, genderArr],
      ),
    );
  }
}
