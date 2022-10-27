import { EntityRepository, Repository } from 'typeorm';
import { ArticleTemplateSlotEntity } from '../entities/article-template-slot.entity';

@EntityRepository(ArticleTemplateSlotEntity)
export class ArticleTemplateSlotRepository extends Repository<ArticleTemplateSlotEntity> {}
