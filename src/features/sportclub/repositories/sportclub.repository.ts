import { EntityRepository, Repository } from 'typeorm';
import { SportclubEntity } from '../entities/sportclub.entity';

@EntityRepository(SportclubEntity)
export class SportclubRepository extends Repository<SportclubEntity> {}
