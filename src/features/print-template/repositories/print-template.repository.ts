import { EntityRepository, Repository } from 'typeorm';
import { PrintTemplateEntity } from '../entities/print-template.entity';

@EntityRepository(PrintTemplateEntity)
export class PrintTemplateRepository extends Repository<PrintTemplateEntity> {}
