import { EntityRepository, Repository } from 'typeorm';
import { ArticleSizeEntity } from '../entities/article-size.entity';

@EntityRepository(ArticleSizeEntity)
export class ArticleSizeRepository extends Repository<ArticleSizeEntity> {}
