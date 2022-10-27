import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ACEntity } from '../../../shared/entities';
import { TeamEntity } from '../../team/entities/team.entity';
import { CollectionArticleEntity } from './collection-article.entity';

@Entity('ac_collection')
export class CollectionEntity extends ACEntity {
  @Column({ length: 64, nullable: true })
  name: string;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  @ManyToOne(() => TeamEntity, (team) => team.collections)
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity;

  @OneToMany(
    () => CollectionArticleEntity,
    (collectionArticle) => collectionArticle.collection,
    { cascade: true },
  )
  collectionArticles: CollectionArticleEntity[];
}
