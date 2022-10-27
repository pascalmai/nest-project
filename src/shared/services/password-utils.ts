import { genSalt, hash, compare } from 'bcrypt';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export const generatePasswordHash = (password: string): Observable<string> => {
  return from(genSalt()).pipe(mergeMap((salt) => from(hash(password, salt))));
};

export const comparePassword = (
  password: string,
  hash: string,
): Observable<boolean> => {
  return from(compare(password, hash));
};
