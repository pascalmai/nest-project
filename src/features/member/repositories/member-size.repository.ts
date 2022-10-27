import { EntityRepository, Repository } from 'typeorm';
import { MemberSizeEntity } from '../entities/member-size.entity';
import { MemberSizeDto } from '../member.dto';
import keys from 'lodash/keys';
import map from 'lodash/map';
import get from 'lodash/get';
import find from 'lodash/find';

@EntityRepository(MemberSizeEntity)
export class MemberSizeRepository extends Repository<MemberSizeEntity> {
  deleteMemberSizes(memberId: string) {
    return this.delete({ memberId });
  }

  async saveMemberSizes(memberId: string, payload: MemberSizeDto) {
    const idents = keys(payload);

    const categories = await this.query(
      `select ac.id, ac.ident from ac_category ac where ac.ident in (${idents
        .map((i) => `'${i}'`)
        .join(', ')});`,
    );

    const items = map(payload, (jakoSizeId, ident) => ({
      memberId,
      jakoSizeId,
      categoryId: get(
        find(categories, (c) => c.ident === ident),
        'id',
      ),
    }));

    const entities = this.create(items);

    return this.save(entities);
  }
}
