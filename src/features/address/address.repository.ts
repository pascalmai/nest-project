import { EntityRepository, Repository } from 'typeorm';
import { AddressEntity } from './address.entity';

@EntityRepository(AddressEntity)
export class AddressRepository extends Repository<AddressEntity> {}
