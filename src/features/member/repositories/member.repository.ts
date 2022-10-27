import { EntityRepository, Repository } from 'typeorm';
import { MemberEntity } from '../entities/member.entity';

@EntityRepository(MemberEntity)
export class MemberRepository extends Repository<MemberEntity> {}
