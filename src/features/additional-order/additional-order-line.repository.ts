import { EntityRepository, Repository } from 'typeorm';
import { AdditionalOrderEntity } from './additional-order.entity';

@EntityRepository(AdditionalOrderEntity)
export class AdditionalOrderRepository extends Repository<AdditionalOrderEntity> {}
