import { EntityRepository, Repository } from 'typeorm';
import { CollectionEntity } from '../entities/collection.entity';

@EntityRepository(CollectionEntity)
export class CollectionRepository extends Repository<CollectionEntity> {}
