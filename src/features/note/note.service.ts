import { Injectable } from '@nestjs/common';
import { from, map, Observable } from 'rxjs';
import { NoteRepository } from './note.repository';
import { NoteDto } from './note.dto';

@Injectable()
export class NoteService {
  constructor(private readonly noteRepository: NoteRepository) {}

  getAll(): Observable<NoteDto[]> {
    return from(this.noteRepository.find());
  }

  createNotes(orders: NoteDto[]): Observable<NoteDto[]> {
    return from(this.noteRepository.save(orders));
  }

  getImportedOrderNotesById(id: string) {
    return from(this.noteRepository.find({ importedOrderId: id }));
  }

  getOrderNotesById(id: string) {
    return from(this.noteRepository.find({ orderId: id }));
  }

  delete(id: string) {
    return from(this.noteRepository.delete({ id })).pipe(
      map(() => this.noteRepository.find()),
    );
  }
}
