import { Injectable } from '@nestjs/common';
import {
  catchError,
  concatMap,
  forkJoin,
  from,
  map,
  Observable,
  of,
} from 'rxjs';
import { SportclubContactRepository } from '../repositories/sportclub-contact.repository';
import fs, { promises as fsp } from 'fs';
import { uploadFilesPath } from '../../../shared/constants';
import path from 'path';
import { OkResponseDto } from '../../../shared/dto';

@Injectable()
export class SportclubContactService {
  constructor(
    private readonly sportclubContactRepository: SportclubContactRepository,
  ) {}

  removeOldPhotos(sportclubId: string): Observable<OkResponseDto> {
    return from(this.sportclubContactRepository.find({ sportclubId })).pipe(
      concatMap((entities) => {
        if (!entities || !entities.length) {
          return of({});
        }

        return forkJoin(
          entities.map((entity) => {
            if (!entity.photo) {
              return of({});
            }
            const filePath = path.join(uploadFilesPath, entity.photo);

            return from(fsp.access(filePath, fs.constants.F_OK)).pipe(
              map(() => fsp.unlink(filePath)),
              catchError((e) => {
                // No photo found
                return of({ ok: true });
              }),
            );
          }),
        );
      }),
      map(() => ({ ok: true })),
    );
  }

  deleteSportclubContacts(sportclubId: string): Observable<OkResponseDto> {
    return from(this.sportclubContactRepository.delete({ sportclubId })).pipe(
      map(() => ({ ok: true })),
    );
  }

  saveContacts(payload: any[]) {
    const entities = this.sportclubContactRepository.create(payload);

    return from(this.sportclubContactRepository.save(entities));
  }
}
