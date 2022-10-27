import { EntityRepository, Repository } from 'typeorm';
import { OrderLineEntity } from '../entities/order-line.entity';

@EntityRepository(OrderLineEntity)
export class OrderLineRepository extends Repository<OrderLineEntity> {}
