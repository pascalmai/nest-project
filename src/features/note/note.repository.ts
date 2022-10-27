import { EntityRepository, Repository } from 'typeorm';
import { NoteEntity } from './note.entity';

@EntityRepository(NoteEntity)
export class NoteRepository extends Repository<NoteEntity> {}
