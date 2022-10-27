import { EntityRepository, Repository } from 'typeorm';
import { ArticleGenderEntity } from '../entities/article-gender.entity';

@EntityRepository(ArticleGenderEntity)
export class ArticleGenderRepository extends Repository<ArticleGenderEntity> {}
