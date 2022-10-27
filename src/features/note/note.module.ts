import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteRepository } from './note.repository';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';

@Module({
  imports: [TypeOrmModule.forFeature([NoteRepository])],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
