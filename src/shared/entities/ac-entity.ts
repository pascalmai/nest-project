import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class ACEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
