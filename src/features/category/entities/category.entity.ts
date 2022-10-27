import { Column, Entity, OneToMany } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { MemberSizeEntity } from '../../member/entities/member-size.entity';
import { JakoCategoryEntity } from './jako-category.entity';

@Entity('ac_category')
export class CategoryEntity extends ACEntity {
  @Column({ length: 64 })
  ident: string;

  @OneToMany(() => JakoCategoryEntity, (jakoCategory) => jakoCategory.category)
  jakoCategories: JakoCategoryEntity[];

  @OneToMany(() => MemberSizeEntity, (size) => size.category)
  memberSizes: MemberSizeEntity[];
}
