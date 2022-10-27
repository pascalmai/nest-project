import { EntityRepository, Repository } from 'typeorm';
import { ImportedOrderLineEntity } from '../entities/imported-order-line.entity';

@EntityRepository(ImportedOrderLineEntity)
export class ImportedOrderLineRepository extends Repository<ImportedOrderLineEntity> {}
