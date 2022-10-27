import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { CategoryEntity } from '../../category/entities/category.entity';
import { JakoSizeEntity } from '../../jako-size/jako-size.entity';
import { MemberEntity } from './member.entity';

@Entity('ac_member_size')
export class MemberSizeEntity extends ACEntity {
  @Column({ name: 'member_id', type: 'uuid' })
  memberId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'jako_size_id' })
  jakoSizeId: string;

  @ManyToOne(() => MemberEntity, (member) => member.sizes)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @ManyToOne(() => CategoryEntity, (category) => category.memberSizes)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => JakoSizeEntity, (jakoSize) => jakoSize.memberSizes)
  @JoinColumn({ name: 'jako_size_id' })
  jakoSize: JakoSizeEntity;
}
