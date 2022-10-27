import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { JakoSizeEntity } from '../../jako-size/jako-size.entity';
import { ArticleGenderEntity } from './article-gender.entity';

@Entity('ac_article_size')
export class ArticleSizeEntity extends ACEntity {
  @Column({ name: 'gender_id', type: 'uuid' })
  genderId: string;

  @Column({ name: 'jako_size_id', length: 64 })
  jakoSizeId: string;

  @Column({ length: 64 })
  ean: string;

  @Column({ name: 'available_from', type: 'date' })
  availableFrom: Date;

  @Column({ name: 'available_to', type: 'date' })
  availableTo: Date;

  @Column({
    name: 'weight_in_kg',
    type: 'numeric',
    precision: 6,
    scale: 3,
    default: 0,
  })
  weightInKg: number;

  @Column({
    name: 'volume_in_liter',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  volumneInLiter: number;

  @ManyToOne(() => ArticleGenderEntity, (gender) => gender.sizes)
  @JoinColumn({ name: 'gender_id' })
  gender: ArticleGenderEntity;

  @ManyToOne(() => JakoSizeEntity, (jakoSize) => jakoSize.sizes)
  @JoinColumn({ name: 'jako_size_id', referencedColumnName: 'jakoSizeId' })
  jakoSize: JakoSizeEntity;
}
