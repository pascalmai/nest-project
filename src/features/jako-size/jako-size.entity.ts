import { Column, Entity, OneToMany } from 'typeorm';
import { ACEntity } from '../../shared/entities';
import { ArticleSizeEntity } from '../article/entities/article-size.entity';
import { MemberSizeEntity } from '../member/entities/member-size.entity';

@Entity('ac_jako_size')
export class JakoSizeEntity extends ACEntity {
  @Column({ name: 'jako_size_id', length: 64, unique: true })
  jakoSizeId: string;

  @Column({ length: 64 })
  name: string;

  @OneToMany(() => MemberSizeEntity, (size) => size.jakoSize)
  memberSizes: MemberSizeEntity[];

  @OneToMany(() => ArticleSizeEntity, (size) => size.jakoSize)
  sizes: ArticleSizeEntity[];
}
