import { EntityRepository, Repository } from 'typeorm';
import { JakoCategoryEntity } from '../entities/jako-category.entity';

@EntityRepository(JakoCategoryEntity)
export class JakoCategoryRepository extends Repository<JakoCategoryEntity> {}
