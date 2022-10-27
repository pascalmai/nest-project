import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthJwtGuard } from '../auth/guards/auth-jwt.guard';
import { NoteService } from './note.service';
import { NoteDto } from './note.dto';
import { firstValueFrom, Observable } from 'rxjs';
import { IsAdminGuard } from '../auth/guards/is-admin.guard';

@UseGuards(AuthJwtGuard, IsAdminGuard)
@Controller('note')
export class NoteController {
  private readonly logger = new Logger(NoteController.name);

  constructor(private readonly noteService: NoteService) {}

  @Get()
  async getAll(): Promise<NoteDto[]> {
    return await firstValueFrom(this.noteService.getAll());
  }

  @Get('imported/:id')
  async getImportedOrderNotes(@Param('id') id: string) {
    const orders = await firstValueFrom(
      this.noteService.getImportedOrderNotesById(id),
    );

    this.logger.log(
      `imported order additional orders: ${JSON.stringify(orders)}`,
    );

    return orders;
  }

  @Get(':id')
  async getOrderNotes(@Param('id') id: string) {
    return await firstValueFrom(this.noteService.getOrderNotesById(id));
  }

  @Post()
  create(@Body() notes: NoteDto[]): Observable<NoteDto[]> {
    return this.noteService.createNotes(notes);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.noteService.delete(id);
  }
}
