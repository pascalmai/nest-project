import { EntityRepository, Repository } from 'typeorm';
import { JakoSizeEntity } from './jako-size.entity';

@EntityRepository(JakoSizeEntity)
export class JakoSizeRepository extends Repository<JakoSizeEntity> {}
