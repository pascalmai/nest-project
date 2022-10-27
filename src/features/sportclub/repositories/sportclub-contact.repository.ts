import { EntityRepository, Repository } from 'typeorm';
import { SportclubContactEntity } from '../entities/sportclub-contact.entity';

@EntityRepository(SportclubContactEntity)
export class SportclubContactRepository extends Repository<SportclubContactEntity> {}
