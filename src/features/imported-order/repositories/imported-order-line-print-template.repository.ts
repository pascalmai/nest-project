import { EntityRepository, Repository } from 'typeorm';
import { ImportedOrderLinePrintTemplateEntity } from '../entities/imported-order-line-print-template.entity';

@EntityRepository(ImportedOrderLinePrintTemplateEntity)
export class ImportedOrderLinePrintTemplateRepository extends Repository<ImportedOrderLinePrintTemplateEntity> {}